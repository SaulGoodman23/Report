const express = require("express");
const cors = require("cors");
const multer = require("multer");
const XLSX = require("xlsx");

let reportSummary;

function report(fileName) {
  const totalQuantitySalesBaseOnCity = {};
  const workBook = XLSX.readFile(`./uploads/${fileName}`);

  const workSheet = workBook.Sheets["FoodSales"];
  const sheetToJson = XLSX.utils.sheet_to_json(workSheet);
  sheetToJson.forEach((sale) => {
    if (!totalQuantitySalesBaseOnCity[sale.City]) {
      totalQuantitySalesBaseOnCity[sale.City] = sale.Qty;
    } else {
      totalQuantitySalesBaseOnCity[sale.City] += sale.Qty;
    }
  });
  return totalQuantitySalesBaseOnCity;
}

const app = express();
app.use(cors());

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./uploads");
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});

var upload = multer({ storage: storage }).single("file");

app.post("/api/v1/upload", (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      console.log(err);
    } else {
      var FileName = req.file?.filename;
      reportSummary = report(FileName);
      res.status(200).json("OK");
    }
  });
});

app.get("/api/v1/report", (req, res) => {
  res.status(200).json(reportSummary);
});

app.listen(3000, () => {
  console.log("The server is running on port 3000...");
});
