backend comments_rest{
        .host = "localhost";
        .port = "3000";
}

backend comments_stream{
        .host = "localhost";
        .port = "3001";
}

backend photos{
	.host = "localhost";
	.port = "3002";
}

sub vcl_recv {	
    if (req.url ~ "stream") {
        set req.backend = comments_stream;
	return(pipe);
    }

    if (req.url ~ "photo") {
       set req.backend = photos;
    }
    else {
        set req.backend = comments_rest;
    }

    if(req.request == "GET"){
	return(lookup);
    }
    else{
	return(pass);
    }
}
