/** @jsx React.DOM */
'use strict';

// Widgets
var ShoutBox = React.createClass({
    render: function(){
        var comments = [];
        for(var i=0; i<this.state.comments.length; i++){
            comments.push(<Comment c={this.state.comments[i]} baseUrl={this.props.baseUrl}/>)
        }
        return (
            <div className="shoutBox" style={shoutBoxStyle}>
                <div style={shoutBoxHeaderStyle}>Shout Amongst Yourselves</div>
                <CommentForm baseUrl={this.props.baseUrl} addComment={this.addComment} onUrl={this.props.onUrl}/>
                <div style={{overflowY:"scroll", height: "500px"}}>
                    {comments}
                </div>
            </div>
        );
    },

    getInitialState: function(){
        return {
            comments: [{
                user: "Admin",
                body: "Coments Are Loading..."
            }]
        }
    },

    addComment: function(comment){
        var state = this.state;

        // see if it's already accounted for (i.e. it's the comment our user just posted...
        for(var i=0; i< state.comments.length; i++){
            if(state.comments[i].id == comment.id){
                return;
            }
        }

        state.comments.unshift(comment);
        this.setState(state);
    },

    componentDidMount: function(){
        var component = this;
        // Get initial fetch of comments
        var encodedUrl = encodeURIComponent(this.props.onUrl)

        $.get(this.props.baseUrl + "/comments.json?url="+encodedUrl, function(result){
            this.setState({comments: result});

            // subscribe to comment stream
            if(!!window.EventSource){
                var source = new EventSource(this.props.baseUrl + "/stream/?url=" + encodedUrl);
                source.addEventListener("newcomment", function(e){
                    var data = JSON.parse(e.data);
                    var comment = data.obj;
                    component.addComment(comment);
                    return;
                }, false);
            }
            else{
                // you're using IE, so you don't get real time updates until you get browser updates.
            }
        }.bind(this));
    }
});

var Comment = React.createClass({
    render: function(){
        var img = "";
        if(this.props.c.photo_id){
            var photoUrl = this.props.baseUrl + "/photo?id=" + this.props.c.photo_id;
            img = (<img src={photoUrl} style={{width: "100%", height: "auto:"}}/>);
        }
        return(
            <div className="comment" style={commentStyle}>
                <div style={userDisplayStyle}>Posted by <a style={userDisplayLinkStyle} href={"mailto:"+ this.props.c.email}>{this.props.c.user}</a></div>
                {img}
                <div style={commentBodyStyle}>{this.props.c.body}</div>
            </div>
        )
    }
});

var CommentForm = React.createClass({
    render: function(){
        var addPhoto = (<input type="button" onClick={this.addPhoto} value="add a photo"></input>);
        if(this.refs.photo){
            addPhoto = "Photo uploaded"
        }

        if(this.refs.needsPhoto){
            return(
                <div className="commentForm" style={commentFormStyle}>
                    <Dropzone style={{width:"100%", height:"80px", border:"dashed"}} onDrop={this.onPhotoDrop}>Drag and drop a file, or just click</Dropzone>
                </div>
            );
        }
        else {
            return (
                <div className="commentForm" style={commentFormStyle}>
                    <div style={userInfoInputStyle}>
                        <div style={nameInputStyle}>
                            <label>
                                Name:
                            </label>
                            <input type="text" ref="user"/>
                        </div>
                        <div style={emailInputStyle}>
                            <label>
                                Email:
                            </label>
                            <input type="text" ref="email"/>
                        </div>
                        <br style={{clear: "both"}}/>
                    </div>
                    <div>
                        <textarea ref="yourComment" style={textAreaStyle}/>
                    </div>
                    <div>
                        <input type="button" ref="submit" value="submit" onClick={this.handleSubmit}/>
                        {addPhoto}
                    </div>
                </div>
            );
        }
    },

    addPhoto: function(){
        this.refs.needsPhoto=true;
        this.forceUpdate();
    },

    onPhotoDrop: function(droppedFiles){
        this.refs.needsPhoto=false;
        this.refs.isUploading=true;
        this.forceUpdate();
        var widget = this;
        fileUpload(this.props.baseUrl+"/photo", droppedFiles[0], function(resp){
            widget.refs.photo = resp.id;
            widget.refs.isUploading = false;
            widget.forceUpdate();
        })
    },

    handleSubmit: function(){
        var commentForm = this;
        var name = commentForm.refs['user'].getDOMNode().value;
        var email = commentForm.refs['email'].getDOMNode().value;
        var body = commentForm.refs['yourComment'].getDOMNode().value;
        var photo = commentForm.refs['photo'];
        var url = commentForm.props.onUrl;

        $.ajax({
            url: commentForm.props.baseUrl + "/comments.json",
            type: "post",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
                "user": name,
                "body": body,
                "email": email,
                "photo_id": photo,
                "url": url
            }),
            success: function(comment){
                commentForm.refs['user'].getDOMNode().value = "";
                commentForm.refs['email'].getDOMNode().value = "";
                commentForm.refs['yourComment'].getDOMNode().value = "";

                // Add the comment to the UI immediately
                commentForm.props.addComment(comment);
            },
            error: function(jqxhr, status, response){
                alert("something's wrong: " + status + "\n" + response + "\n" + jqxhr.responseText);
            }
        })
        //todo
    }
});

// todo namespaces and such
window.fileUpload = function(url, file, callback){
    //old school
    var fd = new FormData();
    fd.append("upload", file);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.onreadystatechange = function (x,y,z) {
        if (xhr.readyState == 4) {
            if(xhr.status != 200){
                alert("upload failed");
                callback({status:"busted"});
            }
            else{
                callback(JSON.parse(xhr.responseText));
            }
        }
    };
    xhr.send(fd);
};

window.createShoutbox = function(baseUrl, id) {
    var url = location.href;
    if($('meta[property="og:url"]').length){
        url = $('meta[property="og:url"]').attr("content");
    }
    React.render(
        <ShoutBox baseUrl={baseUrl} onUrl={url}/>,
        document.getElementById(id)
    )
}