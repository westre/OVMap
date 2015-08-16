var markerSize = { x: 22, y: 40 };

google.maps.Marker.prototype.setLabel = function(label){
    this.label = new MarkerLabel({
        map: this.map,
        marker: this,
        text: label
    });
    this.label.bindTo('position', this, 'position');
};

var MarkerLabel = function(options) {
    this.setValues(options);
    this.span = document.createElement('span');
    this.span.className = 'map-marker-label';
};

MarkerLabel.prototype = $.extend(new google.maps.OverlayView(), {
    onAdd: function() {
        this.getPanes().overlayImage.appendChild(this.span);
        var self = this;
        this.listeners = [
            google.maps.event.addListener(this, 'position_changed', function() { self.draw();    })];
    },
    draw: function() {
        var text = String(this.get('text'));
        var position = this.getProjection().fromLatLngToDivPixel(this.get('position'));
        this.span.innerHTML = text;
        this.span.style.left = (position.x - (markerSize.x / 2)) - (text.length * 3) + 10 + 'px';
        this.span.style.top = (position.y - markerSize.y + 40) + 'px';
    }
});
