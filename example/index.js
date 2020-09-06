const fs = require('fs');
const output = require('d3node-output');
const d3 = require('d3-node')().d3;
const ind = require('../index');
const express = require('express');
const app = express();
const path = require('path');

const makePie = () => {
        const d3nPie = ind.pie;
        const csvString = fs.readFileSync('data/data.csv').toString();///reading the datacd 
        const data = d3.csvParse(csvString);  
        output('./example/output', d3nPie({ data: data }));
        return path.join(__dirname + '/output.html');
     
}

app.get('/pie',  (req, res) => {
    
    let pa = makePie()
    //.then(()=>{
    console.log("********SENDING FILE",pa);
    res.sendFile(pa)
});

app.get('/',(req,res)=>{
    res.send("hi");
})
// });

app.listen(3000);
