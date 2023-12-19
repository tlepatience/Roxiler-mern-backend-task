// const express = require('express');
// const axios = require('axios');
// const app = express();
// const PORT = 5000;
// const https = require('https');
// app.listen(PORT);

// let url = "https://s3.amazonaws.com/roxiler.com/product_transaction.json";

// app.get('./', async(req,res)=>{

//     try{
//         const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
//         const fdata = response.data;
//        const d =  res.JSON(fdata);
//        console.log(d);
//     }
//     catch(error){
//         console.error(error);
//         res.statusCode(500).json({error: " INTERNal server Error!"});

//     }
// });
const axios = require('axios');
const express = require('express');
const app = express();

app.use(express.json());

const productsUrl = 'https://s3.amazonaws.com/roxiler.com/product_transaction.json';

const Product = {
  id: Number,
  title: String,
  price: Number,
  description: String,
  category: String,
  image: String,
  sold: Boolean,
  dateOfSale: Date,
};

app.get('/products', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const response = await axios.get(productsUrl);
    const products = response.data;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {
      page,
      limit,
      totalPages: Math.ceil(products.length / limit),
      products: products.slice(startIndex, endIndex),
    };

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/statistics', async (req, res) => {
    const selectedMonth = parseInt(req.query.selectedMonth);
  
    try {
      const response = await axios.get(productsUrl);
      const products = response.data;
  
      // Filter products for the selected month
      const filteredProducts = products.filter(product => {
        const productDate = new Date(product.dateOfSale);
        const productMonth = productDate.getMonth() + 1; // Months are 0-indexed
  
        return productMonth === selectedMonth;
      });
  
      // Calculate statistics
      const totalSaleAmount = filteredProducts.reduce((total, product) => total + product.price, 0);
      const totalSoldItems = filteredProducts.filter(product => product.sold).length;
      const totalNotSoldItems = filteredProducts.filter(product => !product.sold).length;
  
      res.status(200).json({
        totalSaleAmount,
        totalSoldItems,
        totalNotSoldItems,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get('/barChart', async (req, res) => {
    const selectedMonth = parseInt(req.query.selectedMonth);
  
    try {
      const response = await axios.get(productsUrl);
      const products = response.data;
  
      // Filter products for the selected month
      const filteredProducts = products.filter(product => {
        const productDate = new Date(product.dateOfSale);
        const productMonth = productDate.getMonth() + 1; // Months are 0-indexed
  
        return productMonth === selectedMonth;
      });
  
      // Define price ranges
      const priceRanges = [
        { min: 0, max: 100 },
        { min: 101, max: 200 },
        { min: 201, max: 300 },
        { min: 301, max: 400 },
        { min: 401, max: 500 },
        { min: 501, max: 600 },
        { min: 601, max: 700 },
        { min: 701, max: 800 },
        { min: 801, max: 900 },
        { min: 901, max: Infinity },
      ];
  
      // Count the number of items in each price range
      const barChartData = {};
      priceRanges.forEach(range => {
        const count = filteredProducts.filter(product => product.price >= range.min && product.price <= range.max).length;
        barChartData[`${range.min}-${range.max === Infinity ? 'above' : range.max}`] = count;
      });
  
      res.status(200).json({ barChartData });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get('/pieChart', async (req, res) => {
    const selectedMonth = parseInt(req.query.selectedMonth);
  
    try {
      const response = await axios.get(productsUrl);
      const products = response.data;
  
      // Filter products for the selected month
      const filteredProducts = products.filter(product => {
        const productDate = new Date(product.dateOfSale);
        const productMonth = productDate.getMonth() + 1; // Months are 0-indexed
  
        return productMonth === selectedMonth;
      });
  
      // Count the number of items in each category
      const pieChartData = {};
      filteredProducts.forEach(product => {
        const category = product.category;
        pieChartData[category] = (pieChartData[category] || 0) + 1;
      });
  
      res.status(200).json({ pieChartData });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.get('/combinedData', async (req, res) => {
    const selectedMonth = parseInt(req.query.selectedMonth);
  
    try {
      // Fetch data from the /products endpoint
      const productsResponse = await axios.get(`http://localhost:3000/products?page=1&limit=10`);
      const productsData = productsResponse.data;
  
      // Fetch data from the /statistics endpoint
      const statisticsResponse = await axios.get(`http://localhost:3000/statistics?selectedMonth=${selectedMonth}`);
      const statisticsData = statisticsResponse.data;
  
      // Fetch data from the /pieChart endpoint
      const pieChartResponse = await axios.get(`http://localhost:3000/pieChart?selectedMonth=${selectedMonth}`);
      const pieChartData = pieChartResponse.data;
  
      // Combine responses
      const combinedData = {
        products: productsData,
        statistics: statisticsData,
        pieChart: pieChartData,
      };
  
      res.status(200).json(combinedData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  const PORT = process.env.PORT || 3000;
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });