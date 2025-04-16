'use strict';
import * as mongose from "mongoose";
mongose.connect("mongodb://localhost:27017/cms").then(() => {
    console.log('MongoDB Connected!');
});

export { mongose } ;
