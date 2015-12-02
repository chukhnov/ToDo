//MODEL
ToDoListModel = Backbone.Model.extend({});


//COLLECTION
ToDoListCollection = Backbone.Collection.extend({model: ToDoListModel});
var toDoListCollection = new ToDoListCollection([]);


//VIEW
ViewToDoListSet = Backbone.View.extend({
    el: '#addTask',
    events: {
        'submit': 'submit',
        'click .button': 'button'

    },
    submit: function (e) {
        e.preventDefault();
        var toDoListModel = new ToDoListModel({});
        toDoListModel.set('task', $(e.currentTarget).find('input[type=text]').val());
        console.log(toDoListModel.get('task'));
        this.collection.add(toDoListModel);


    },
    button: function (e) {
        e.preventDefault();
        for (var i = 0; i < _.size(this.collection); i++) {
            if (this.collection.models[i].get('checked') == true) {
                this.collection.models[i].destroy();
                i--

            }
        }
    }
});
var viewToDoListSet = new ViewToDoListSet({collection: toDoListCollection});


//VIEW
ToDoListViewCollection = Backbone.View.extend({
    tagName: 'ul',
    initialize: function () {
        this.collection.on('add', this.addOne, this);
        return this;
    },
    addOne: function (task) {
        var viewModelToDoList = new ViewModelToDoList({model: task});
        this.$el.append(viewModelToDoList.render().el);

    }
});


//VIEW
ViewModelToDoList = Backbone.View.extend({
    tagName: 'li',
    initialize: function () {
        this.model.on('destroy', this.remove, this);
    },
    template: _.template('<span><%= task %></span><input type="checkbox">'),
    render: function () {
        var template = this.template(this.model.toJSON());
        this.$el.html(template);
        return this;
    },
    events: {
        'click [type="checkbox"]': 'clicked'
    },
    clicked: function () {
        if (this.model.get('checked') == true) {
            this.model.set('checked', false)
        }
        else {
            this.model.set('checked', true)
        }
    },

    remove: function () {
        this.$el.remove();
    }

});


var toDoListViewCollection = new ToDoListViewCollection({collection: toDoListCollection});
$('.tasks').html(toDoListViewCollection.render().el);






