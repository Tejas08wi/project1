const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing");
const path=require("path");
const methodoverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");

main().then(()=>{
    console.log("connection is established");
}).catch((err)=>{
    console.log(err);
})
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodoverride("_method"));
app.engine("ejs",ejsMate);  
app.use(express.static(path.join(__dirname,"public")));

app.listen(8080,()=>{
    console.log("app is listening");
})
app.get("/",(req,res)=>{
    res.send("server is listening");
})
app.get("/listings",wrapAsync(async(req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}));
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs")
})


app.get("/listings/:id",wrapAsync(async(req,res,next)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
}));
app.post("/listings",wrapAsync(async(req,res)=>{
        const newListing=new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");

}));
app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));
app.put("/listings/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect("/listings");
}));
app.delete("/listings/:id",wrapAsync(async(req,res)=>{
    let{id}=req.params;
    let deleted=await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

app.post("/listings/:id/reviews", async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(new Review);
    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
    });


app.all("*",(req,res,next)=>{
    next((new ExpressError(404,"Page not found !")));
})
app.use((err,req,res,next)=>{
    let{statuscode,message}=err;
    res.render("error.ejs",{message})
    // res.status(statuscode).send(message);
})
app.use((err,req,res,next)=>{
    res.send("Something went wrong")
})