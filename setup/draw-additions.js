zebkit.package("draw", function(pkg, Class) {
    /**
     * The check box ticker view.
     * @class  zebkit.draw.CheckboxCustomView
     * @extends zebkit.draw.View
     * @constructor
     * @param {String} [color] color of the ticker
     */
    pkg.CheckboxCustomView = Class(pkg.View, [
        function(color) {
            if (arguments.length > 0) {
                this.color = color;
            }
        },

        function $prototype() {
            /**
             * Ticker color.
             * @attribute color
             * @type {String}
             * @readOnly
             * @default "rgb(65, 131, 255)"
             */
            this.color = "rgb(65, 131, 255)";

            this.paint = function(g,x,y,w,h,d){
                g.beginPath();
                g.strokeStyle=this.color;
                g.lineWidth=2;
                g.moveTo(x+5,y+h-2);
                g.lineTo(x+1,y+h-7);
                g.stroke();
                g.beginPath();
                g.moveTo(x+w-2,y+2);
                g.lineTo(x+5,y+h-2);
                g.stroke();
                g.lineWidth=1;
            };
        }
    ]);


    pkg.ShadowRender = zebkit.Class(pkg.Render, [
        function (target) {
            this.$super(target);
            this.shadowOffsetX = this.shadowOffsetY = 4;
            this.shadowBlur = 2;
            this.shadowColor = "rgba(0,0,0,0.1)";
            this.left = this.top = 0;
            this.right = this.bottom = 4;
        },

        function setup(shadowOffsetX, shadowOffsetY, shadowBlur, shadowColor) {
            this.shadowOffsetX = shadowOffsetX == null ? 0 : shadowOffsetX;
            this.shadowOffsetY = shadowOffsetY == null ? 0 : shadowOffsetY;
            this.shadowBlur = shadowBlur == null ? 15 : shadowBlur;
            this.shadowColor = shadowColor == null ? "#E5E5E5" : shadowColor;
        },

        function getTop() {
            return this.top + (this.target != null && this.target.getTop != null ? this.target.getTop() : 0);
        },

        function getLeft() {
            return this.left + (this.target != null && this.target.getLeft != null ? this.target.getLeft() : 0);
        },

        function getRight() {
            return this.right + (this.target != null && this.target.getRight != null ? this.target.getRight() : 0);
        },

        function getBottom() {
            return this.bottom + (this.target != null && this.target.getBottom != null ? this.target.getBottom() : 0);
        },

        function paint(g, x, y, w, h, t) {
            g.shadowColor = this.shadowColor;
            g.shadowOffsetX = this.shadowOffsetX;
            g.shadowOffsetY = this.shadowOffsetY;
            g.shadowBlur = this.shadowBlur;

            x += this.left;
            y += this.top;
            w = w - this.left - this.right;
            h = h - this.top - this.bottom;

            if (this.target.outline != null) {
                this.target.outline(g, x, y, w, h, t);
                g.setColor("#F5F5F5");
                g.fill();
            }

            g.shadowColor = undefined;
            g.shadowOffsetX = 0;
            g.shadowOffsetY = 0;
            g.shadowBlur = 0;

            this.target.paint(g, x, y, w, h, t);
        }
    ]);

});