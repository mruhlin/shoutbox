/** @jsx React.DOM */
'use strict';

// Styles
var commentStyle = {
    "fontFamily":'proxima-nova,"Helvetica Neue",Helvetica,Roboto,Arial,sans-serif',
    "fontSize": "8pt",
    "width": "100%",
    "border": "1px solid #eeeeee",
    "margin": "5px"
};

var userDisplayStyle = {
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
    "width": "100%"
};

var nameInputStyle = {
    "float": "left"
};

var emailInputStyle = {
    "float": "right"
};

// Widgets
var ShoutBox = React.createClass({displayName: "ShoutBox",
    render: function(){
        var comments = [];
        for(var i=0; i<this.state.comments.length; i++){
            comments.push(React.createElement(Comment, {c: this.state.comments[i]}))
        }
        return (React.createElement("div", {className: "shoutBox"}, 
            React.createElement(CommentForm, {baseUrl: this.props.baseUrl, addComment: this.addComment}), 
            comments
        ));
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
        return(
            React.createElement("div", {className: "commentForm"}, 
                React.createElement("div", null, 
                    React.createElement("div", {style: nameInputStyle}, "Name: ", React.createElement("input", {type: "text", ref: "user"})), 
                    React.createElement("div", {style: emailInputStyle}, "Email: ", React.createElement("input", {type: "text", ref: "email"})), 
                    React.createElement("br", {style: {clear: both}})
                ), 
                React.createElement("div", null, 
                    React.createElement("textarea", {ref: "yourComment", style: textAreaStyle})
                ), 
                React.createElement("div", null, 
                    React.createElement("input", {type: "button", ref: "submit", value: "submit", onClick: this.handleSubmit})
                )
            )
        );
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

React.render(
    React.createElement(ShoutBox, {baseUrl: "http://localhost:8001"}),
    document.getElementById("shoutboxHere")
)