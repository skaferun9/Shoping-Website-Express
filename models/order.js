const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    orderBy: {
        userId: {
            type: Schema.Types.ObjectId, ref: 'user',
            required: true
        },
        email: {
            type: String,
            required: true
        }
    },
    item: {
        type: Object,
        required: true
    }
});

module.exports = mongoose.model('Order', orderSchema);

