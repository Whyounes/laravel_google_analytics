function SortableList( el ){
    //element to wrap the <ul>
    this.el = $( el );
    //reference to the list after it has been created
    this.list = undefined;


    this.init = function(){
        //clear the wrapper
        this.el.html('');

        // create, append and reference the <ul>
        var ul = $( '<ul class="compare_list"></ul>' );
        this.el.append(ul);
        this.list = ul;

        // make it sortable
        this.list.sortable();
    }//init

    /*
        text: text to be displayed
        data: dataobject to be attached to the element
            name: name of the data
            value: value of the data
    */
    this.addListItem = function( text, data ){
        var li = $( '<li class="ui-state-default compare_list_item">' + text + '<span class="ui-icon ui-icon-closethick compare_list_item_remove"></li>' );
        if( data )
            li.data( 'widget-data', data );

        li.find(".compare_list_item_remove").click( this.removeListItem );

        this.list.append( li );

    }//addListItem

    this.removeListItem = function( e ){
        $( e.target ).parents(".compare_list_item").remove();
    }//removeListItem

    this.getListItems = function( ){
        return this.list.find("li");
    }
}//CompareListComponent
