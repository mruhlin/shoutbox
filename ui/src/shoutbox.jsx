/** @jsx React.DOM */
'use strict';

// Styles
var shoutBoxStyle = {
    "fontFamily":'proxima-nova,"Helvetica Neue",Helvetica,Roboto,Arial,sans-serif',
    "fontSize": "10pt",
    "maxWidth": "400px",
    "border": "1px solid #eeeeee",
};

var shoutBoxHeaderStyle = {
    "width": "100%",
    "backgroundColor": "#eeeeee",
    "fontSize": "12pt",
    "marginTop": "0",
    "paddingTop": "2px",
    "paddingBottom": "2px",
    "marginBottom": "5px"
}

var commentStyle = {
    "width": "99%",
    "border": "1px solid #eeeeee",
    "marginTop": "5px",
};

var userDisplayStyle = {
    "fontSize": "8pt",
    "backgroundColor": "#eeeeee",
    "padding": "2px"
};

var userDisplayLinkStyle = {
    "color": "black",
    "textDecoration": "none"
};

var commentBodyStyle = {
    "padding": "2px",
    "fontSize": "10pt"
};

var textAreaStyle = {
    "width": "100%",
    "border": "1px solid #eeeeee",
    "webkitBoxSizing": "border-box",
    "mozBoxSizing": "border-box",
    "boxSizing": "border-box",
    "minHeight": "80px"
};

var userInfoInputStyle = {
    "marginBottom": "5px"
};

var nameInputStyle = {
    "float": "left",
};

var emailInputStyle = {
    "float": "right",
};

// Widgets
var ShoutBox = React.createClass({
    render: function(){
        var comments = [];
        for(var i=0; i<this.state.comments.length; i++){
            comments.push(<Comment c={this.state.comments[i]} baseUrl={this.props.baseUrl}/>)
        }
        return (
            <div className="shoutBox" style={shoutBoxStyle}>
                <div style={shoutBoxHeaderStyle}>Shout It Out</div>
                <CommentForm baseUrl={this.props.baseUrl} addComment={this.addComment}/>
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
        $.get(this.props.baseUrl + "/comments.json", function(result){
            this.setState({comments: result});

            // subscribe to comment stream
            if(!!window.EventSource){
                var source = new EventSource(this.props.baseUrl + "/stream/");
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
                <div className="commentForm">
                    <Dropzone style={{width:"100%", height:"80px", border:"dashed"}} onDrop={this.onPhotoDrop}>Drag and drop a file, or just click</Dropzone>
                </div>
            );
        }
        else {
            return (
                <div className="commentForm">
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

        $.ajax({
            url: commentForm.props.baseUrl + "/comments.json",
            type: "post",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
                "user": name,
                "body": body,
                "email": email,
                "photo_id": photo
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

    /*
    var formData = new FormData(file);
    $.ajax({
        url: url,
        type: 'POST',
        //Ajax events
        success: callback,
        error: function(jqxhr, status, response){
            alert("photo upload failed");
            callback({status: "busted"});
        },
        // Form data
        data: {upload: formData},
        processData: false,
        contentType: "multipart/form-data"
    });*/
};


window.createShoutbox = function(baseUrl, id) {
    React.render(
        <ShoutBox baseUrl={baseUrl}/>,
        document.getElementById(id)
    )
}







// Borrowed from https://github.com/paramaggarwal/react-dropzone

var Dropzone = React.createClass({
    getDefaultProps: function() {
        return {
            supportClick: true,
            multiple: true
        };
    },

    getInitialState: function() {
        return {
            isDragActive: false
        }
    },

    propTypes: {
        onDrop: React.PropTypes.func.isRequired,
        size: React.PropTypes.number,
        style: React.PropTypes.object,
        supportClick: React.PropTypes.bool,
        accept: React.PropTypes.string,
        multiple: React.PropTypes.bool
    },

    onDragLeave: function(e) {
        this.setState({
            isDragActive: false
        });
    },

    onDragOver: function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";

        this.setState({
            isDragActive: true
        });
    },

    onDrop: function(e) {
        e.preventDefault();

        this.setState({
            isDragActive: false
        });

        var files;
        if (e.dataTransfer) {
            files = e.dataTransfer.files;
        } else if (e.target) {
            files = e.target.files;
        }

        var maxFiles = (this.props.multiple) ? files.length : 1;
        for (var i = 0; i < maxFiles; i++) {
            files[i].preview = URL.createObjectURL(files[i]);
        }

        if (this.props.onDrop) {
            files = Array.prototype.slice.call(files, 0, maxFiles);
            this.props.onDrop(files, e);
        }
    },

    onClick: function () {
        if (this.props.supportClick === true) {
            this.open();
        }
    },

    open: function() {
        this.refs.fileInput.getDOMNode().click();
    },

    render: function() {

        var className = this.props.className || 'dropzone';
        if (this.state.isDragActive) {
            className += ' active';
        };

        var style = this.props.style || {
                width: this.props.size || 100,
                height: this.props.size || 100,
                borderStyle: this.state.isDragActive ? "solid" : "dashed"
            };


        return (
            React.createElement("div", {className: className, style: style, onClick: this.onClick, onDragLeave: this.onDragLeave, onDragOver: this.onDragOver, onDrop: this.onDrop},
                React.createElement("input", {style: {display: 'none'}, type: "file", multiple: this.props.multiple, ref: "fileInput", onChange: this.onDrop, accept: this.props.accept}),
                this.props.children
            )
        );
    }

});