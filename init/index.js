const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing");

main().then(()=>{
    console.log("connection is established");
}).catch((err)=>{
    console.log(err);
})
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}
initDB();
async function initDB(){
     await Listing.deleteMany({});
     await Listing.insertMany(initData.data);
     console.log("data was initialized");
};
