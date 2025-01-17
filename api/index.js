const express = require("express")
const app = express();
const cors = require("cors")
const bcrypt = require("bcryptjs")
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken")

const Place = require("./models/Place")
const User = require("./models/User");
const cookieParser = require("cookie-parser");
const imageDownloader = require('image-downloader');
const multer = require("multer")
const fs = require("fs");
const Booking = require("./models/Booking");
require("dotenv").config()

const bcryptSalt = bcrypt.genSaltSync(10)
const jwtSecret = "fdjgdjfhgdf456897dfjgk"

app.use(cors({
    credentials: true,
    origin: "http://localhost:5173"
}))
app.use(express.json())
app.use(cookieParser())
app.use("/uploads", express.static(__dirname + "/uploads"))

const connectDB = async () => {
    try {
        const res = await mongoose.connect(process.env.MONGO_DB)
        console.log("DB CONNECTED")
    } catch (error) {
        console.log(error)
    }
}

connectDB()

function getUserDataFromToken(req){
    return new Promise((resolve, reject) => {
        jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
            if(err) throw err;
            resolve(userData)
        })
    }) 
}

app.get("/test", (req, res) => {
    res.json({test: "ok"})
})

app.post("/register", async (req, res) => {
    const {name, email, password} = req.body;

   try {
    const userDoc = await User.create({
        name,
        email,
        password: bcrypt.hashSync(password, bcryptSalt)
    })

    res.json({userDoc})
   } catch (error) {
    return res.status(400).json({message: error})
   }
})

app.post("/login", async (req, res) => {
    const {email, password} = req.body;
    const userDoc = await User.findOne({email});
    if(userDoc){
        const passOk = bcrypt.compareSync(password, userDoc.password)
        if(passOk){
            jwt.sign({email: userDoc.email, id: userDoc._id, name: userDoc.name}, jwtSecret, {} , (err, token) => {
                if(err) throw err;
                res.cookie("token", token, ).json(userDoc)
            })
        } else {
            res.status(400).json("pass not ok")
        }
    } else {
        res.status(400).json("Not found")
    }
})

app.get("/profile", async (req, res) => {
    const {token} = req.cookies;
    if(token){
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if(err) throw err;
            const {name, email, _id} = await User.findById(userData.id)
            res.json({name, email, _id})
        })
    } else {
        res.json(null)
    }
})

app.post('/logout', (req, res) => {
    res.cookie("token", "").json(true)
})

app.post("/upload-by-link", async (req, res) => {
    const {link} = req.body;
    const newName = Date.now() + ".jpg"
    await imageDownloader.image({
        url: link,
        dest: __dirname + "/uploads/" + newName,
    })
    res.json({newName})
})

const photosMiddleware = multer({dest: "uploads/"});

app.post("/upload", photosMiddleware.array("photos", 100), (req, res) => {

    const uploadedFiles = []

    for(let i=0; i <req.files.length; i++){
        const {path, filename, originalname} = req.files[i];
        const parts = originalname.split(".");
        const ext = parts[parts.length - 1];
        const newPath = filename + "." + ext;
        fs.renameSync(path, "uploads/"+newPath)
        uploadedFiles.push(newPath)
    }
    res.json(uploadedFiles);
})

app.post("/places", (req, res) => {
    const {token} = req.cookies;
    const {title, address, addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price} = req.body;

    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if(err) throw err;
        const placeDoc = await Place.create({
            owner: userData.id,
            title, address, 
            photos: addedPhotos, 
            description, perks, extraInfo, checkIn, checkOut, maxGuests, price
        })
        res.json(placeDoc)
    })
})

app.get("/user-places", (req, res) => {
    const {token} = req.cookies;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        const {id} = userData;
        const placeDoc = await Place.find({owner: id});
        res.json(placeDoc)
    })
})

app.get("/places/:id", async (req, res) => {
    const {id} = req.params;
    console.log(id)
    const placeDoc = await Place.findById(id);
    res.json(placeDoc)
})

app.put("/places", async (req, res) => {
    const {token} = req.cookies;
    const {id, title, address, addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price} = req.body;

    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if(err) throw err;
        const placeDoc = await Place.findById(id)
        if(userData.id.toString() === placeDoc.owner.toString()){
            placeDoc.set({
            title, address, 
            photos: addedPhotos, 
            description, perks, extraInfo, checkIn, checkOut, maxGuests, price
            })
            await placeDoc.save()
            res.json("ok")
        }
    })
})

app.get("/places", async (req, res) => {
    const placeDoc = await Place.find()
    res.json(placeDoc)
})

app.post("/bookings", async (req, res) => {
    const userData = await getUserDataFromToken(req)
    const {place, checkIn, checkOut, numberOfGuests, name, phone, price} = req.body;

    Booking.create({
        place, checkIn, checkOut, numberOfGuests, name, phone, price,
        user: userData.id
    }).then((doc) => {
        res.json(doc)
    }).catch((err) => {
        throw err;
    })
})

app.get("/bookings", async (req, res) => {
    const userData = await getUserDataFromToken(req)
    console.log(userData)
    res.json(await Booking.find({user: userData.id}).populate("place"))

})

app.listen(4000, () => {
    console.log("Server started on PORT 4000!")
})