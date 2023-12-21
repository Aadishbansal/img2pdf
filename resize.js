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
      .resize(width, height)
      .toBuffer((err, resizedBuffer) => {
        if (err) {
          reject(err);
        } else {
          resolve(resizedBuffer);
        }
      });
  });
};

const convertToPDF = async (req, res, next) => {
  try {
    const pdfDoc = new PDFDocument();

    for (let file of req.files) {
      if (file.buffer && file.buffer.length > 0) {
        const resizedBuffer = await resizeImage(file.buffer, 500, 500);
        if (resizedBuffer && resizedBuffer.length > 0) {
          pdfDoc.addPage({ margin: 20 }).image(resizedBuffer, {
            fit: [500, 500],
            // align: "center",
            // valign: "center",
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

app.get("/", convertToPDF);
app.listen(3000, () => console.log("Server running"));
