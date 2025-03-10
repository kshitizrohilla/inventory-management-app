import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { format, subDays, startOfMonth, eachDayOfInterval, parseISO } from 'date-fns'
import Chart from 'react-google-charts'
import Topbar from '@/components/Topbar'

export default function SalesDashboard() {
  const [salesData, setSalesData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dateRange, setDateRange] = useState('week')
  const [products, setProducts] = useState([])
  const router = useRouter()

  useEffect(() => {
    fetchSalesData()
    fetchProducts()
  }, [dateRange])

  const fetchSalesData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      const res = await fetch('/api/sales', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        const salesByDate = processSalesData(data.data)
        setSalesData(salesByDate)
      }
    } catch (error) {
      console.error('Error fetching sales data:', error)
      setError('Failed to fetch sales data')
    } finally {
      setLoading(false)
    }
  }

  const processSalesData = (sales) => {
    let startDate
    const endDate = new Date()
    if (dateRange === 'week') {
      startDate = subDays(new Date(), 7)
    } else if (dateRange === 'month') {
      startDate = startOfMonth(new Date())
    } else if (dateRange === 'year') {
      startDate = subDays(new Date(), 365)
    }
    const filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.timestamp)
      return saleDate >= startDate && saleDate <= endDate
    })
    const salesByDate = {}
    filteredSales.forEach(sale => {
      const dateStr = format(new Date(sale.timestamp), 'yyyy-MM-dd')
      if (!salesByDate[dateStr]) {
        salesByDate[dateStr] = { date: dateStr, sales: [] }
      }
      salesByDate[dateStr].sales.push(sale)
    })
    const allDates = eachDayOfInterval({ start: startDate, end: endDate })
    return allDates.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd')
      return salesByDate[dateStr] || { date: dateStr, sales: [] }
    })
  }

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      const res = await fetch('/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setProducts(data.data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const calculateTotalSales = () => {
    return salesData.reduce((total, day) => {
      const dayTotal = day.sales.reduce((sum, sale) => sum + sale.total, 0)
      return total + dayTotal
    }, 0)
  }

  const calculateTotalItemsSold = () => {
    return salesData.reduce((total, day) => {
      const dayTotal = day.sales.reduce((sum, sale) => sum + sale.quantity, 0)
      return total + dayTotal
    }, 0)
  }

  const calculateAverageOrderValue = () => {
    const totalSales = calculateTotalSales()
    const totalOrders = salesData.reduce((total, day) => total + day.sales.length, 0)
    return totalOrders > 0 ? totalSales / totalOrders : 0
  }

  const getDailySalesData = () => {
    const labels = salesData.map(day => format(parseISO(day.date), 'MMM dd'))
    const salesAmounts = salesData.map(day => day.sales.reduce((sum, sale) => sum + sale.total, 0))
    const itemsSold = salesData.map(day => day.sales.reduce((sum, sale) => sum + sale.quantity, 0))
    return { labels, salesAmounts, itemsSold }
  }

  const getTopSellingProducts = () => {
    const productSales = {}
    salesData.forEach(day => {
      day.sales.forEach(sale => {
        if (!productSales[sale.productName]) {
          productSales[sale.productName] = { quantity: 0, revenue: 0 }
        }
        productSales[sale.productName].quantity += sale.quantity
        productSales[sale.productName].revenue += sale.total
      })
    })
    return Object.entries(productSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
  }

  const getSalesByHourOfDay = () => {
    const hourlyData = Array(24).fill(0)
    salesData.forEach(day => {
      day.sales.forEach(sale => {
        const hour = new Date(sale.timestamp).getHours()
        hourlyData[hour] += sale.total
      })
    })
    return { labels: Array.from({ length: 24 }, (_, i) => `${i}:00`), data: hourlyData }
  }

  const getSalesByDayOfWeek = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayData = Array(7).fill(0)
    salesData.forEach(day => {
      const dayOfWeek = new Date(day.date).getDay()
      const dayTotal = day.sales.reduce((sum, sale) => sum + sale.total, 0)
      dayData[dayOfWeek] += dayTotal
    })
    return { labels: days, data: dayData }
  }

  const dailySalesData = getDailySalesData()
  const topSellingProducts = getTopSellingProducts()
  const salesByHour = getSalesByHourOfDay()
  const salesByDay = getSalesByDayOfWeek()

  const salesDataLineChart = [
    ['Date', 'Sales Amount (₹)'],
    ...dailySalesData.labels.map((label, index) => [label, dailySalesData.salesAmounts[index]])
  ]
  const itemsSoldBarChart = [
    ['Date', 'Items Sold'],
    ...dailySalesData.labels.map((label, index) => [label, dailySalesData.itemsSold[index]])
  ]
  const hourlyBarChart = [
    ['Hour', 'Sales by Hour (₹)'],
    ...salesByHour.labels.map((label, index) => [label, salesByHour.data[index]])
  ]
  const dayOfWeekBarChart = [
    ['Day', 'Sales by Day (₹)'],
    ...salesByDay.labels.map((label, index) => [label, salesByDay.data[index]])
  ]
  const topProductsPieChart = [
    ['Product', 'Quantity'],
    ...topSellingProducts.map(product => [product.name, product.quantity])
  ]
  const revenueByCategory = () => {
    const categoryRevenue = {}
    salesData.forEach(day => {
      day.sales.forEach(sale => {
        const product = products.find(p => p._id === sale.productId)
        if (product) {
          const category = product.category
          if (!categoryRevenue[category]) {
            categoryRevenue[category] = 0
          }
          categoryRevenue[category] += sale.total
        }
      })
    })
    return Object.entries(categoryRevenue)
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
  }
  const revenueByCategoryData = revenueByCategory()
  const revenueByCategoryChart = [
    ['Category', 'Revenue (₹)'],
    ...revenueByCategoryData.map(item => [item.category, item.revenue])
  ]

  return (
    <>
      <Topbar />
      <div className="container mx-auto p-4 w-full sm:w-3/4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Sales Stats</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-3 rounded shadow-lg hover:shadow-xl transition-all">
              <h3 className="text-base font-medium">Total Sales</h3>
              <p className="text-lg">₹ {calculateTotalSales().toLocaleString()}</p>
            </div>
            <div className="bg-white p-3 rounded shadow-lg hover:shadow-xl transition-all">
              <h3 className="text-base font-medium">Total Items Sold</h3>
              <p className="text-lg">{calculateTotalItemsSold()}</p>
            </div>
            <div className="bg-white p-3 rounded shadow-lg hover:shadow-xl transition-all">
              <h3 className="text-base font-medium">Avg. Order Value</h3>
              <p className="text-lg">₹ {calculateAverageOrderValue().toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          <div className="w-full">
            <h3 className="text-lg font-semibold mb-4">Sales Data</h3>
            <div className="bg-white p-4 rounded shadow-lg hover:shadow-xl transition-all">
              <Chart
                chartType="LineChart"
                width="100%"
                height="350px"
                data={salesDataLineChart}
                options={{
                  title: 'Sales Data',
                  curveType: 'function',
                  legend: { position: 'bottom' },
                  colors: ['#e74c3c']
                }}
              />
            </div>
          </div>
          <div className="w-full">
            <h3 className="text-lg font-semibold mb-4">Items Sold</h3>
            <div className="bg-white p-4 rounded shadow-lg hover:shadow-xl transition-all">
              <Chart
                chartType="ColumnChart"
                width="100%"
                height="350px"
                data={itemsSoldBarChart}
                options={{
                  title: 'Items Sold',
                  legend: { position: 'none' },
                  colors: ['#2ecc71']
                }}
              />
            </div>
          </div>
        </div>
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          <div className="w-full">
            <h3 className="text-lg font-semibold mb-4">Sales by Hour of Day</h3>
            <div className="bg-white p-4 rounded shadow-lg hover:shadow-xl transition-all">
              <Chart
                chartType="ColumnChart"
                width="100%"
                height="350px"
                data={hourlyBarChart}
                options={{
                  title: 'Sales by Hour of Day',
                  hAxis: { title: 'Hour' },
                  vAxis: { title: 'Sales (₹)' },
                  legend: { position: 'none' },
                  colors: ['#9b59b6']
                }}
              />
            </div>
          </div>
          <div className="w-full">
            <h3 className="text-lg font-semibold mb-4">Sales by Day of Week</h3>
            <div className="bg-white p-4 rounded shadow-lg hover:shadow-xl transition-all">
              <Chart
                chartType="ColumnChart"
                width="100%"
                height="350px"
                data={dayOfWeekBarChart}
                options={{
                  title: 'Sales by Day of Week',
                  legend: { position: 'none' },
                  colors: ['#f1c40f']
                }}
              />
            </div>
          </div>
        </div>
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          <div className="w-full">
            <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
            <div className="bg-white p-4 rounded shadow-lg hover:shadow-xl transition-all">
              <Chart
                chartType="PieChart"
                width="100%"
                height="350px"
                data={topProductsPieChart}
                options={{
                  title: 'Top Selling Products',
                  colors: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#4bc0c0']
                }}
              />
            </div>
          </div>
          <div className="w-full">
            <h3 className="text-lg font-semibold mb-4">Revenue by Product Category</h3>
            <div className="bg-white p-4 rounded shadow-lg hover:shadow-xl transition-all">
              <Chart
                chartType="ColumnChart"
                width="100%"
                height="350px"
                data={revenueByCategoryChart}
                options={{
                  title: 'Revenue by Product Category',
                  legend: { position: 'none' },
                  colors: ['#d35400']
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}