const express = require("express");
const fileUpload = require("express-fileupload");
const fs = require("fs");

const app = express();

app.use(fileUpload({ limits: { fileSize: 50 * 1024 * 1024 } }));
app.use(express.json());
app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  const files = [];
  fs.readdir(`${__dirname}/store`, (err, data) => {
    if (err) return res.render("error", { errorCode: "500", errorText: err });
    data.forEach(item=>{
      const size = (fs.statSync(`./store/${item}`).size / (1024*1024)).toString();
      files.push({
        name : item ,
        size : `${size.slice(0, size.indexOf('.')+3)} MB`
      })
    })
    res.render("index", { files: files });
  });
});

app.post("/upload", (req, res) => {
  if (req.files) {
    const file = req.files.file;
    const fileName = file.name.replaceAll(" ", "_");
    file.mv(`${__dirname}/store/${fileName}`, (err) => {
      if (err) {
        console.log(err);
        res.render("error", { errorCode: "500", errorText: err });
      } else {
        res.redirect("/");
      }
    });
  } else {
    res.render("error", {
      errorCode: "404",
      errorText: "There are no file",
    });
  }
});

app.get('/delete/:name', (req, res)=>{
  if(req.params.name.length>0){
    fs.readdir(`${__dirname}/store`, (err, data) => {
      if (err) return res.render("error", { errorCode: "500", errorText: err });
      data.forEach(item=>{
        if(item==req.params.name){
          fs.unlink(`${__dirname}/store/${item}`, (err)=>{
            if (err) return res.render("error", { errorCode: "500", errorText: err });
          })
          return res.redirect('/');
        }
      })
    });
  }else{
    return res.render("error", { errorCode: "500", errorText: "name is invalid" });
  }
})

app.get('/download/:name', (req, res)=>{
  const name = req.params.name;
  if(name.length>0){
    res.download(`${__dirname}/store/${name}`, (err)=>{
        if (err) return res.render("error", { errorCode: "500", errorText: err });
    });
  }else{
    return res.render("error", { errorCode: "500", errorText: "name is invalid" });
  }
})

app.listen(5000, () => {
  console.log("server running: http://localhost:5000");
});
