# shoutbox

Shoutbox is a lightweight comments widget that developers can easily embed in their web sites.
It is built on a rails-based microservices architecture with UI components built in react.js.

![mandatory architecture drawing](flowchart.png)

There are 3 main services:

## Comments REST service

This is a basic JSON REST API that allows users to create and list comments.
```
POST /comments.json {"name": "user name", "email": "email@address.com", "url": "http://www.foo.com", "photo_id": "abc123}
```

```
GET /comments.json?url=http://www.foo.com
```
Name, email, and url are required.  Photo ID is optional and served up by the photos service.

Comments are persisted in rails's basic sqlite database because it was easy and this is not meant for production.  Use a
real database if you want to run this in production.

When a comment is added, we send an event to a redis pub/sub channel named after the parent URL of the comment.  This is
how the REST service notifies the streaming service that new comments are ready.

## Comments Stream service

This is a service that uses HTML5 server-sent events (SSE) to stream comments to the client in real time.

```
GET /stream?url=http://www.foo.com
```

## Photo Service

This is a simple service that allows users to upload photos.  Each photo is stored in a hash-partitioned database on
disk, and requests to get a particular photo will redirect to a static location served and cached by nginx.

```
>>> POST /photo (file data)
<<< {status: "ok", id: "some_guid.jpg"
>>> GET /photo?id=some_guid.jpg
<<< 302 /photoUploads/some_hash/some_guid.jpg
```

## React Widget

This is the piece that gets dropped into a customer's web site, i.e.
```
<script src="http://localhost/ui/shoutbox.js"></script>
...
<div id="put_box_here"></div>
<script>createShoutbox("http://localhost", "put_box_here")</script>
```