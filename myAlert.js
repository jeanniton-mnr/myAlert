var MyAlert = function (option) {
    $('#myalert').remove();

    this.overlay = $('<div />', { 'id': 'myalert', 'class': 'myalert--overlay reset-this' });
    this.box = $('<div />', { 'class': 'myalert--box' });
    this.cross= $('<div />', {'class': 'myalert--cross'});
    this.arrow = $('<div />', { 'class': 'myalert--arrow' });
    this.container = $('<div />', { 'class': 'myalert--container' });
    this.header = $('<div />', { 'class': 'myalert--header' });
    this.wrapper = $('<div />', {'class': 'myalert--iscroll-wrapper'});
    this.body = $('<div />', { 'class': 'myalert--body' });
    this.footer = $('<div />', { 'class': 'myalert--footer'});

    this._init(option);
};
MyAlert.fn = MyAlert.prototype;

MyAlert.fn._init = function(option){
    this.box.append(this.arrow).append(this.cross).append(this.container);
    this.overlay.append(this.box);
    this.wrapper.append(this.body);
    $(document.body).after(this.overlay);
    this.box.pos = {};
    
    var iscroll_opt = {scrollbars: true,mouseWheel: true,interactiveScrollbars: true,shrinkScrollbars: 'scale',fadeScrollbars: true};
    this.wrapper.iscroll = new IScroll(this.wrapper[0], iscroll_opt);
    
    this._setOption(option);
    this._resize();


    this.overlay.on("mousedown", $.proxy(this._mousedown, this));
    this.overlay.on("mouseup", $.proxy(this._mouseup, this));
    this.cross.on("click", $.proxy(this._close, this));
    $(window).on("resize", $.proxy(this._resize, this));
};
MyAlert.fn._mousedown = function(event){
    if(this.isShown() && event.currentTarget === event.target){
        this.overlay.ownMouseDown = true;
        window.getSelection().removeAllRanges();
        return false;
    }
};
MyAlert.fn._mouseup = function(event){
    if(event.currentTarget === event.target && this.overlay.ownMouseDown){
        this._close();
        this.overlay.ownMouseDown = false;
        return false;
    }
};
MyAlert.fn._resize = function(){
    if(this.isShown())
        this._close();
    var size = {'width': document.body.scrollWidth + "px", 'height': document.body.scrollHeight + "px"};
    this.overlay.css(size);
};

MyAlert.fn._setOption = function(option){
    option = option || {};
    this.box.css({'background-color': option.displayColor || '#FFF'});
};
MyAlert.fn._clear = function()
{
    this.header.html('');
    this.body.html('');
    this.footer.html('');
    this.container.html('');
    window.setTimeout($.proxy(this.wrapper.iscroll.refresh, this.wrapper.iscroll), 100);
};
MyAlert.fn._close = function(){
    this._clear();
    this.box.pos = {};
    if(this.isShown()){
        this.overlay.css({display:'none'});
    }
};
MyAlert.fn._remove = function(){
    this._close();
    this.overlay.remove();
};
MyAlert.fn._show = function ()
{
    this.overlay.css({display:'block'});
    window.setTimeout($.proxy(this.wrapper.iscroll.refresh, this.wrapper.iscroll), 100);
};
MyAlert.fn.show = function(pos, content){

    if( (content.header  != null)| (content.body != null) | (content.footer != null) ){
        this._close();
    }else{
        console.log("MyAlert: Nothing to show!");
        return;
    }

    if(content.header){
        this.header.append(content.header);
        this.container.append(this.header);
    }
    if(content.body){
        this.body.append(content.body);
        /*Append the "wrapper" to the container as it holds "body" and will allow iscroll.*/
        this.container.append(this.wrapper);
    }
    if(content.footer){
        this.footer.append(content.footer);
        this.container.append(this.footer);
    }

    //Javascript's opration like $.ajax migth add new contents on the page. Thus, changing its size.
    this._resize();

    if(true)
    {
        var visibility = this.overlay.css('visibility');
        var display = this.overlay.css('display');
        var pointer_events = this.overlay.css('pointer-events');

        this.overlay.css({'visibility':'hidden','display':'block', 'pointer-events':'none'});
        this.overlay._w= this.overlay[0].offsetWidth;
        this.overlay._h = this.overlay[0].offsetHeight;
        this.box._w = this.box[0].offsetWidth;
        this.box._h = this.box[0].offsetHeight;
        this.arrow._w = this.arrow[0].offsetWidth;
        this.arrow._h = this.arrow[0].offsetHeight;

        this.overlay.css({'visibility':visibility, 'display':display,'pointer-events':pointer_events});
    }
    this.box.pos = pos;
    var box_top;
    if ((this.box.pos.y - $(document).scrollTop())/0.99 > this.box._h) {
        /*Default alert box position: pop-up is shown upward the selection*/
        box_top = this.box.pos.y - (this.arrow._h * Math.sqrt(2) / 2) - this.box._h;
        this.box.css({ "bottom":"initial", "top": box_top + "px" });
        this.arrow.removeClass("myalert--arrow-up");
        this.arrow.addClass("myalert--arrow-down");
        this.arrow.css({"top":"initial", "bottom": -(this.arrow._h/2) + "px"});
    } else {
        box_top = this.box.pos.y + (this.arrow._h * Math.sqrt(2) / 2);
        this.box.css({ "top": box_top + "px" });
        this.arrow.removeClass("myalert--arrow-down");
        this.arrow.addClass("myalert--arrow-up");
        this.arrow.css({"bottom":"initial", "top": -(this.arrow._h/2) + "px"});
    }
    var box_left = this.box.pos.x - (this.box._w >> 1);
    var arrow_left = (this.box._w >> 1) - (this.arrow._w / 2);
    var alpha;
    if (this.box.pos.x + (this.box._w >> 1) > this.overlay._w) {
        var alpha = (this.box.pos.x + (this.box._w >> 1)) - this.overlay._w;
        this.box.css({ "right": "initial", "left": (box_left - alpha) + "px" });
        this.arrow.css({ "right": "initial", "left": (arrow_left + alpha) + "px" });
    } else if (this.box.pos.x - (this.box._w>>1) < 0) {
        var alpha = (this.box._w >> 1) - this.box.pos.x;
        this.box.css({ "right": "initial", "left": (box_left + alpha) + "px" });
        this.arrow.css({ "right": "initial", "left": (arrow_left - alpha) + "px" });
    } else {
        box_left = this.box.pos.x - (this.box._w >> 1);
        this.box.css({ "left": box_left + "px" });
        this.arrow.css({ "left": arrow_left + "px" });
    }
    
    this._show();
};
MyAlert.fn.update = function(content){
    if(this.box.pos.x && this.box.pos.y && (this.box.pos.x + this.box.pos.y !== 0)){
        this.show(this.box.pos, content);
    }else{
        console.log("MyAlert: Cannot update dialog!");
    };
};
MyAlert.fn.isShown = function(){
    return (this.overlay[0].parentElement && this.overlay.css('display').toLowerCase().trim() != 'none');
};