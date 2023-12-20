const express = require("express");
const app = express();
const multer = require("multer");
const path = require("path");
const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "backend/images/input/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

app.use(multer({ storage: fileStorage }).array("files"));

const { exec } = require("child_process");

const image = (req, res, next) => {
  let filesList = "";
  req.files.forEach((element) => {
    filesList += element.path;
    filesList += " ";
  });
  const outputPath = path.join(__dirname, "images", "output", "output.pdf");
  exec(`magick convert ${filesList} ${outputPath}`, (err, stdout, stderr) => {
    if (err) {
      console.log(err);
      throw err;
    }
    res.sendFile(outputPath);
  });
};

app.get("/", image);
app.listen(3000, () => console.log("server running"));
