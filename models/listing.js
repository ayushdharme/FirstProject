const mongoose = require("mongoose");
const review = require("./reviews");
const schema = mongoose.Schema;


const listingSchema = new schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    image:{
        type:String,
        default:"https://images.unsplash.com/photo-1662733961684-2f22cc17a516?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDE3fE04alZiTGJUUndzfHxlbnwwfHx8fHw%3D",
        set:(v)=> v === "" ?"https://images.unsplash.com/photo-1662733961684-2f22cc17a516?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDE3fE04alZiTGJUUndzfHxlbnwwfHx8fHw%3D":v
    },
    price:{
        type:Number,
        required:true,
        min:[10,"price must be at least 10"]
    },
    location:{
        type:String,
        required:true
    },
    country:{
        type:String,
        required:true
    },
    reviews:[
        {
            type:schema.Types.ObjectId,
            ref:"review"
        }
    ],
    owner:{
        type:schema.Types.ObjectId,
        ref:"user"
    },
    coordinates: {
        type: {
            type: String,
            enum: ["Point"],
            required: true,
            default: "Point"
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    }
});

//deleting all the reviews associated with the listing
//which is deleted
listingSchema.post("findOneAndDelete",async(list)=>{
    if(list){
        await review.deleteMany({_id:{$in:list.reviews}})
    }
});

const listing = mongoose.model("listing",listingSchema);
module.exports = listing;