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
    "width": "100%",
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
var ShoutBox = React.createClass({displayName: "ShoutBox",
    render: function(){
        var comments = [];
        for(var i=0; i<this.state.comments.length; i++){
            comments.push(React.createElement(Comment, {c: this.state.comments[i]}))
        }
        return (
            React.createElement("div", {className: "shoutBox", style: shoutBoxStyle}, 
                React.createElement("div", {style: shoutBoxHeaderStyle}, "Shout It Out"), 
                React.createElement(CommentForm, {baseUrl: this.props.baseUrl, addComment: this.addComment}), 
                comments
            )
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

var Comment = React.createClass({displayName: "Comment",
    render: function(){
        return(
            React.createElement("div", {className: "comment", style: commentStyle}, 
                React.createElement("div", {style: userDisplayStyle}, "Posted by ", React.createElement("a", {style: userDisplayLinkStyle, href: "mailto:"+ this.props.c.email}, this.props.c.user)), 
                React.createElement("div", {style: commentBodyStyle}, this.props.c.body)
            )
        )
    }
});

var CommentForm = React.createClass({displayName: "CommentForm",
    render: function(){
        var addPhoto = (React.createElement("a", {onClick: this.addPhoto}, "add a photo"));
        if(this.refs.photo){
            addPhoto = "todo photo name here.  remove button?"
        }

        return(
            React.createElement("div", {className: "commentForm"}, 
                React.createElement("div", {style: userInfoInputStyle}, 
                    React.createElement("div", {style: nameInputStyle}, 
                        React.createElement("label", null, 
                            "Name:"
                        ), 
                        React.createElement("input", {type: "text", ref: "user"})
                    ), 
                    React.createElement("div", {style: emailInputStyle}, 
                        React.createElement("label", null, 
                            "Email:"
                        ), 
                        React.createElement("input", {type: "text", ref: "email"})
                    ), 
                    React.createElement("br", {style: {clear: "both"}})
                ), 
                React.createElement("div", null, 
                    React.createElement("textarea", {ref: "yourComment", style: textAreaStyle})
                ), 
                React.createElement("div", null, 
                    React.createElement("input", {type: "button", ref: "submit", value: "submit", onClick: this.handleSubmit}), 
                    addPhoto
                )
            )
        );
    },

    onDrop: function(){
        alert("cool");
    },

    handleSubmit: function(){
        var commentForm = this;
        var name = commentForm.refs['user'].getDOMNode().value;
        var email = commentForm.refs['email'].getDOMNode().value;
        var body = commentForm.refs['yourComment'].getDOMNode().value;

        $.ajax({
            url: commentForm.props.baseUrl + "/comments.json",
            type: "post",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
                "user": name,
                "body": body,
                "email": email
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


window.createShoutbox = function(baseUrl, id) {
    React.render(
        React.createElement(ShoutBox, {baseUrl: baseUrl}),
        document.getElementById(id)
    )
}


// Borrowed from https://github.com/paramaggarwal/react-dropzone

var Dropzone = React.createClass({displayName: "Dropzone",
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