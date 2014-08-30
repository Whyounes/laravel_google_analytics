/*
    el: Widgets wrapper
    columns: array of classe's that each column should have, (ex: [ 'col-md-4', 'col-md-4', 'col-md-4'])
*/

function WidgetsViewer( el, columns, editable, minimizable, closable ){
    this.el = $(el);
    this.columns = columns || ['col-md-12'];
    this.editable = editable || true;
    this.minimizable = minimizable || true;
    this.closable = closable || true;

    this.init = function(){
        //creating the columns
        for( var i = 0; i< this.columns.length; i++ ){
            this.el.append('<div class="widgets_columns ' + this.columns[i] + '"></div>');
        }//for

        $( ".widgets_columns" ).sortable( {
          connectWith: ".widgets_columns",
          handle: ".widget_header",
          cancel: ".widget_toggle",
          placeholder: "widget_placeholder ui-corner-all"
        } );
    }//init

    /*
        title: wigdte title
        body: DOM widget dody
        pos: Column number to be added to
        data: data to be attached to the widget
        editCallback: callback function when the edit icon is clicked, you get the parent widget as a parameter
        toggleCallback: ...
        closeCallback: ...
    */
    this.addWidget = function( title, body, pos, data, editCallback, toggleCallback, closeCallback ){
        pos = pos > this.columns.length ? 0 : pos;

        var widget_close_icon = $('<span class="ui-icon ui-icon-closethick widget_close">'),
            widget_edit_icon = $('</span> <span class="ui-icon ui-icon-pencil widget_edit"></span>'),
            widget_toggle_icon = $('<span class="ui-icon ui-icon-minusthick widget_toggle"></span>');


        var el_widget = $('<div class="widget panel panel-default"></div>'),
            el_widget_header = $('<div class="widget_header panel-heading"></div>'),
            el_widget_body = $('<div class="widget_content panel-body"></div>');
        if( closable )
            el_widget_header.append( widget_close_icon );
        if( minimizable )
            el_widget_header.append( widget_toggle_icon );
        if( editable )
            el_widget_header.append( widget_edit_icon );

        el_widget_header.append( '<h3 class="panel-title">' + title + '</h3>' );
        el_widget_body.append( body );

        el_widget.append( el_widget_header );
        el_widget.append( el_widget_body );

            if( editable )
                widget_edit_icon.click( function( e ){

                    if( editCallback )
                        editCallback( e, el_widget );
                });

            if( minimizable )
                widget_toggle_icon.click( function( e ){
                    toggleWidget( el_widget );

                    if( toggleCallback )
                        toggleCallback( e, el_widget );
                });

            if( closable )
                widget_close_icon.click( function( e ){
                    closeWidget( el_widget );
                    if( closeCallback )
                        closeCallback( e, el_widget );
                });

        el_widget.data("widget-data", data);
        this.el.find('.widgets_columns:eq(' + pos + ')').append( el_widget );

        return el_widget;
    }//addWidget

    function toggleWidget( widget ){
        var icon = $( this );
        icon.toggleClass( "ui-icon-minusthick ui-icon-plusthick" );
        widget.find( ".widget_content" ).toggle();
    }//toggleWidget

    function closeWidget( widget ){
        widget.remove();
    }//closeWidget

    this.getColumnWidgets = function( pos ){
        pos = pos > this.columns.length ? 0 : pos;

        return this.el.find('.widgets_columns:eq(' + pos + ') .widget');
    }//getColumnWidgets

    this.getWidgets = function(){
        return this.el.find('.widgets_columns .widget');
    }//getWidgets

}//WidgetsViewer
