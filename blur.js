const express = require("express");
const app = express();
const multer = require("multer");
const gm = require("gm").subClass({ imageMagick: true });
const fs = require("fs");
const fsPromises = fs.promises;
const path = require("path");
const PDFDocument = require("pdfkit");

const fileStorage = multer.memoryStorage();

app.use(multer({ storage: fileStorage }).array("files"));

const resizeImage = async (buffer, width, height) => {
  return new Promise((resolve, reject) => {
    gm(buffer)
      .resize(width, height, "^")
      .toBuffer((err, resizedBuffer) => {
        if (err) {
          reject(err);
        } else {
          resolve(resizedBuffer);
        }
      });
  });
};
const blur = async (buffer, width, height) => {
  return new Promise((resolve, reject) => {
    gm(buffer)
      .resize(width, height, "^")
      .gravity("Center")
      .extent(width, height)
      .quality(100)
      .toBuffer((err, resizedBuffer) => {
        if (err) {
          reject(err);
        } else {
          resolve(resizedBuffer);
        }
      });
  });
};

const convertToPDFResize = async (req, res, next) => {
  try {
    const pdfDoc = new PDFDocument();

    for (let file of req.files) {
      if (file.buffer && file.buffer.length > 0) {
        const resizedBuffer = await resizeImage(file.buffer, 50, 50);
        if (resizedBuffer && resizedBuffer.length > 0) {
          pdfDoc.addPage({ margin: 20 }).image(resizedBuffer, {
            fit: [350, 350],
            align: "center",
            valign: "center",
          });
        } else {
          console.error("Empty or invalid resized buffer:", file.originalname);
        }
      } else {
        console.error("Empty or invalid image buffer:", file.originalname);
      }
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=output.pdf");

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).send("Server error");
  }
};
const convertToPDFBlur = async (req, res, next) => {
  try {
    const pdfDoc = new PDFDocument();

    for (let file of req.files) {
      if (file.buffer && file.buffer.length > 0) {
        const resizedBuffer = await blur(file.buffer, 50, 50);
        if (resizedBuffer && resizedBuffer.length > 0) {
          pdfDoc.addPage({ margin: 20 }).image(resizedBuffer, {
            fit: [350, 350],
            align: "center",
            valign: "center",
          });
        } else {
          console.error("Empty or invalid resized buffer:", file.originalname);
        }
      } else {
        console.error("Empty or invalid image buffer:", file.originalname);
      }
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=output.pdf");

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).send("Server error");
  }
};

app.get("/resize", convertToPDFResize);
app.get("/blur", convertToPDFBlur);
app.listen(3000, () => console.log("Server running"));

// import axios from "axios";
// const res = await axios("Main.java");
// console.log(res.data);
// import express from "express";

// const image = require("./learn/img2Pdf/image");

// const start =yyy Date.now();
// let count = 0;
// for (let i = 1; i <= 30_000; i++) {
//   count++;
// }

// console.log(count);
// console.log(Date.now() - start);

// mongoose
//   .connect("mongodb://127.0.0.1:27017/test")
//   .then((client) => {
//     // console.log(client);
//   })
//   .catch((err) => console.log(err));
