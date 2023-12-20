const express = require("express");
const app = express();
const multer = require("multer");
const gm = require("gm").subClass({ imageMagick: true });
const fs = require("fs");
const fsPromises = fs.promises;
const path = require("path");

const fileStorage = multer.memoryStorage();

app.use(multer({ storage: fileStorage }).array("files"));

const convertToPDF = async (req, res, next) => {
  try {
    const tempDir = path.join(__dirname, "temp_images");

    // Check if the temporary directory exists, create if not
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const writePromises = req.files.map(async (file) => {
      const filePath = path.join(tempDir, file.originalname);
      await fsPromises.writeFile(filePath, file.buffer);
      return filePath;
    });

    const filePaths = await Promise.all(writePromises);

    const gmConvert = gm()
      .command("convert")
      .in(...filePaths)
      .write(path.join(__dirname, "output.pdf"), async (err) => {
        await Promise.all(
          filePaths.map(async (filePath) => fsPromises.unlink(filePath))
        );

        if (err) {
          console.error(err);
          return res.status(500).send("Conversion failed");
        }
        res.sendFile(path.join(__dirname, "output.pdf"));
      });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

app.get("/", convertToPDF);
app.listen(3000, () => console.log("Server running"));
