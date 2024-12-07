const express = require('express');
const mongodb = require('mongodb');

const db = require('../data/database');

const ObjectId = mongodb.ObjectId;

const router = express.Router();

router.get('/', function (req, res) {
  res.redirect('/posts');
});

router.get('/posts', async function (req, res) {
  const posts = await db
    .getDb()
    .collection('posts')
    .find({}, { title: 1, summary: 1, 'author.name': 1 })
    .toArray();
  res.render('posts-list', { posts: posts });
});

router.get('/new-post', async function (req, res) {
  const authors = await db.getDb().collection('authors').find().toArray();
  res.render('create-post', { authors: authors });
});

router.post('/posts', async function (req, res) {
  const authorId = new ObjectId(req.body.author);
  const author = await db
    .getDb()
    .collection('authors')
    .findOne({ _id: authorId });

  const newPost = {
    title: req.body.title,
    summary: req.body.summary,
    body: req.body.content,
    date: new Date(),
    author: {
      id: authorId,
      name: author.name,
      email: author.email,
    },
  };

  const result = await db.getDb().collection('posts').insertOne(newPost);
  console.log(result);
  res.redirect('/posts');
});

router.get('/posts/:id', async function (req, res) {
  const postId = req.params.id;
  const post = await db
    .getDb()
    .collection('posts')
    .findOne({ _id: new ObjectId(postId) }, { summary: 0 });

  if (!post) {
    return res.status(404).render('404');
  }

  post.humanReadableDate = post.date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  post.date = post.date.toISOString();

  res.render('post-detail', { post: post, comments: null });
});

router.get('/posts/:id/edit', async function (req, res) {
  const postId = req.params.id;
  const post = await db
    .getDb()
    .collection('posts')
    .findOne({ _id: new ObjectId(postId) }, { title: 1, summary: 1, body: 1 });

  if (!post) {
    return res.status(404).render('404');
  }

  res.render('update-post', { post: post });
});

router.post('/posts/:id/edit', async function (req, res) {
  const postId = new ObjectId(req.params.id);
  const result = await db
    .getDb()
    .collection('posts')
    .updateOne(
      { _id: postId },
      {
        $set: {
          title: req.body.title,
          summary: req.body.summary,
          body: req.body.content,
          // date: new Date()
        },
      }
    );

  res.redirect('/posts');
});

router.post('/posts/:id/delete', async function (req, res) {
  const postId = new ObjectId(req.params.id);
  const result = await db
    .getDb()
    .collection('posts')
    .deleteOne({ _id: postId });
  res.redirect('/posts');
});

router.get('/posts/:id/comments', async function(req, res){
	const postId = new ObjectId(req.params.id); // get 요청에서 id로 들어온 값을 ObjectId 형태로 전환후, postId 변수에 할당
    
   	const comment = await db // 프로미스를 이용하여 mongodb에 접근
    .getDb() // 연결된 mongoDB를 가져옴
    .collection('comments') // 해당 mongoDB에서 commnets 컬렉션에 접근
    .find({postId : postId}).toArray(); // {} 안에서 조건 입력후, 찾음. 그 후 배열 형식으로 전환한 다음 comment 변수에 할당.
    
    res.json(comment); // 응답으로 comment를 json 형태로 클라이언트에게 전송
});

router.post('/posts/:id/comments', async function (req, res) {
  const postId = new ObjectId(req.params.id);
  const newComment = {
    postId: postId,
    title: req.body.title,
    text: req.body.text,
  };
  await db.getDb().collection('comments').insertOne(newComment);
  res.redirect('/posts/' + req.params.id);
});

module.exports = router;
