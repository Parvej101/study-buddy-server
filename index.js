const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


// middlewere
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mzyca.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const assignmentCollection = client.db('assignmentDB').collection('assignment');

        const submitAssignment = client.db('assignmentDB').collection('submitAssignment');

        app.get('/assignment', async (req, res) => {
            const cursor = assignmentCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post('/assignment', async (req, res) => {
            const newAssignment = req.body;
            console.log(newAssignment);
            const result = await assignmentCollection.insertOne(newAssignment);
            res.send(result);
        })

        app.delete('/assignment/:id', async (req, res) => {
            const id = req.params.id;
            const result = await assignmentCollection.deleteOne({ _id: new ObjectId(id) });
            res.send(result);
        })
        // Update operation

        app.get('/assignment/:id', async (req, res) => {
            const id = req.params.id;
            const result = await assignmentCollection.findOne({ _id: new ObjectId(id) });
            res.send(result);
        })

        app.put('/assignment/:id', async (req, res) => {
            try {
                const { id } = req.params;
                console.log("reviced ID", id);

                const updatedAssignment = req.body;
                const result = await assignmentCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: updatedAssignment }
                );
                if (result.matchedCount === 0) {
                    res.status(404).send({ message: 'Assignment not found' });
                } else {
                    res.send(result);
                }
            } catch (error) {
                console.error('Error updating assignment:', error);
                res.status(500).send({ message: 'Internal Server Error' });
            }
        });

        // API Endpoint to Submit an Assignment

        app.post('/submitAssignment', async (req, res) => {
            const newSubmitAssignment = req.body;
            console.log(newSubmitAssignment);
            const result = await submitAssignment.insertOne(newSubmitAssignment);
            res.send(result);

        })

        app.get('/submitAssignment', async (req, res) => {
            const cursor = submitAssignment.find({ status: 'pending' });
            const result = await cursor.toArray();
            res.send(result);
        })

        // Pending Assignment API Endpoint

        app.get('/submitAssignment/:id', async (req, res) => {
            const { id } = req.params;

            try {
                // Query MongoDB using the string ID directly
                const assignment = await submitAssignment.findOne({ _id: new ObjectId(id) });

                if (!assignment) {
                    return res.status(404).json({ message: 'Assignment not found' });
                }

                res.json(assignment);
            } catch (error) {
                console.error('Error fetching assignment:', error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });

        // API endpoint to update assignment status and marks
        const { ObjectId } = require('mongodb');

        // API endpoint to update assignment status and marks
       app.put('/submitAssignment/:id', async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const value = req.body;
        const updateDoc = {
            $set: {
                status: value.status,
                marks: value.marks,
                feedback: value.feedback,
            },
        };
        const result = await submitAssignment.updateOne(filter, updateDoc, options);
        res.send(result);
       });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("Server is running")
})
app.listen(port, () => {
    console.log(`Study server is running on port: ${port}`);
})