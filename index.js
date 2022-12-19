const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
require('dotenv').config()


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.w7wfspi.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT (req, res, next) {
    const authHeaders = req.headers.authorization;
    if(!authHeaders){
        return res.status(401).send('unauthorized access')
    }
    const token = authHeaders.split(' ')[1];
    console.log(token)
    
    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'forbidden excess'})
        }
        req.decoded = decoded;
        next();
    })
}

const run = async() => {
    try{
        const allCategories = client.db('Categories-collection').collection('categories');
        const allCategori = client.db('Categories-collection').collection('Category');
        const allBooking = client.db('Categories-collection').collection('bookingData');
        const allWishlist = client.db('Categories-collection').collection('allWishListData');
        const userCollection = client.db('Categories-collection').collection('users');
        const advertizecollection = client.db('Categories-collection').collection('advertize');

        app.get('/categories', async(req, res) => {
            const query = {};
            const singleItem = await allCategories.find(query).toArray();
            res.send(singleItem);
        })
        app.get('/Category/:id', async(req, res) => {
            const id = req.params.id;
            const query = {cat_id: id};
            const service = await allCategori.find(query).toArray();
            res.send(service);
        })
        app.get('/Category', async(req, res) => {
            const query = {};
            const allservice = await allCategori.find(query).toArray();
            res.send(allservice);
        })
        app.get('/advertize', async(req, res) => {
            const query = {};
            const getItems = await advertizecollection.find(query).toArray();
            res.send(getItems);
        })
        app.post('/advertize', async(req, res) => {
            const usrs = req.body;
            const items = await advertizecollection.insertOne(usrs);
            res.send(items);
        })
        app.get('/Category', async(req, res) => {
            const email = req.query.email;
            const query = {email: email};
            const users = await allCategori.find(query).toArray();
            res.send(users);
        })
        app.post('/Category', async(req, res) => {
            const usrs = req.body;
            const items = await allCategori.insertOne(usrs);
            res.send(items);
        })

        app.put('/Category/:id', async(req, res) => {
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    makeAdvetize: true
                }
            }
            const result = await allCategori.updateOne(filter, updateDoc, options);
            res.send(result);
        })
        app.put('/Category/:id', async(req, res) => {
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    makeWishlist: 'wish'
                }
            }
            const result = await allCategori.updateOne(filter, updateDoc, options);
            res.send(result);
        })
        app.delete('/Category/:id', async(req, res) => {
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const result = await allCategori.deleteOne(filter);
            res.send(result)
        })

        app.get('/bookins', async(req, res) => {
            const email = req.query.email;
            // const decodedEmail = req.decoded.email;

            // if(email !== decodedEmail){
            //     return res.status(403).send({message: 'forbidden access'})
            // }

            const query = {email: email};
            const bookings = await allBooking.find(query).toArray();
            res.send(bookings);
        })

        app.post('/bookins', async(req, res) => {
            const booking = req.body;
            const result = await allBooking.insertOne(booking);
            res.send(result);
        })
        app.post('/wishList', async(req, res) => {
            const booking = req.body;
            const result = await allWishlist.insertOne(booking);
            res.send(result);
        })

        app.get('/jwt', async(req, res) => {
            const email = req.query.email;
            const query = {email: email};
            const user = await userCollection.findOne(query);
            if(user){
                const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn: '1h'});
                return res.send({accessToken: token})
            }
            res.status(403).send({accessToken: ''});
        })

        app.get('/users/:role', async(req, res) => {
            const role = req.params.role;
            const query = {role: role};
            const allRole = await userCollection.find(query).toArray();
            res.send(allRole);
        })
        app.delete('/users/:id', async(req, res) => {
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const result = await allCategori.deleteOne(filter);
            res.send(result)
        })
        app.put('/Category', async(req, res) => {
            const email = req.query.email;
            const query = {email: email};
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: "verified"
                }
            }
            const result = await allCategori.updateOne(query, updateDoc, options);
            res.send(result);
        })
        
        app.get('/userrole', async(req, res) => {
            const email = req.query.email;
            const query = {email: email};
            const users = await userCollection.find(query).toArray();
            res.send(users);
        })
        app.get('/userrole/:email', async(req, res) => {
            const email = req.params.email;
            const query = {email: email};
            const users = await userCollection.findOne(query);
            res.send({isAdmin: users?.role === 'Admin'});
        })
        app.get('/userseller/:email', async(req, res) => {
            const email = req.params.email;
            const query = {email: email};
            const users = await userCollection.findOne(query);
            res.send({isSeller: users?.role === 'Seller'});
        })
        app.get('/userBuyer/:email', async(req, res) => {
            const email = req.params.email;
            const query = {email: email};
            const users = await userCollection.findOne(query);
            res.send({isBuyer: users?.role === 'Buyer'});
        })

        app.post('/users', async(req, res) => {
            const usrs = req.body;
            const usr = await userCollection.insertOne(usrs);
            res.send(usr);
        })
    }
    finally{

    }
}
run().catch(error => consol.log(error))



app.get('/', (req, res) => {
    res.send('service portal is running..');
})

app.listen(port, () => {
    console.log(`backend portal is ${port}`)
})