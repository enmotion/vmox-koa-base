'use strict';
import mongoose from "mongoose";
mongoose.connect("mongodb://localhost:27017/cms").then(() => {
    console.log('MongoDB Connected!');
});

export { mongoose } ;
