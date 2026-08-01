const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    details: { 
        type: String 
    },
    price: { 
        type: Number, 
        required: true 
    },
    stock: { 
        type: Number, 
        default: 0 
    },
    sizes: [
        { type: String } // S, M, L, XL, XXL ইত্যাদি
    ],
    img: { 
        type: String 
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);