zebkit.package("ui", function(pkg, Class) {
    // alternative buttons that can be styled differently in theme
    pkg.ActionButton = Class(pkg.Button,[]);
    pkg.ReverseButton = Class(pkg.Button,[]);


    pkg.LoadingPanel = Class(pkg.Panel, [
        function(w, h, s, b) {
            this.$super();
            this.animationConfig = {
                width: w > 0 ? Math.round(w) : 10,
                height: h > 0 ? Math.round(h) : 10,
                speed: s > 0 ? s : 20,
                start: Math.PI * 3/2,
                currentPos: Math.PI * 3/2,
                lineWidth: Math.min(Math.round(w), Math.round(w))/6,
                strokeStyle: "#FFFFFF"
            };

            this.toBorder = b;
            this.borderConfig = {
                colour: "gray",
                width: 0
            };

            this.setPreferredSize(w, h);
            this.loading = this.isVisible = false;
        },
        function setAnimationSpeed(s) {
            this.animationConfig.speed = s
        },
        function setAnimationSize(w, h) {
            if (w > 0) this.animationConfig.width = Math.round(w);
            if (h > 0) this.animationConfig.height = Math.round(h);
            this.setPreferredSize(this.animationConfig.width, this.animationConfig.height);
        },
        function setAnimationLineWidth(w) {
            this.animationConfig.lineWidth = w;
        },
        function setAnimationColour(c) {
            this.animationConfig.strokeStyle = c;
        },
        function setBorderColour(c) {
            this.borderConfig.colour = c;
        },
        function setBorderWidth(w) {
            this.borderConfig.width = w ? w : 0;
        },
        function setLoading(b) {
            var $this = this;

            this.loading = b;
            this.setVisible(b);

            if (b) this.animation = setInterval(function() {
                $this.repaint()
            }, this.animationConfig.speed);
            else clearInterval(this.animation);
        },
        function paint(g) {
            var config = this.animationConfig,
                w = config.width, h = config.height,
                border = this.borderConfig.width,
                start = config.start,
                ps = g.lineWidth;

            g.clearRect(0, 0, w, h);
            g.fillRect(0, border/2, w, h - border);

            g.lineWidth = config.lineWidth;
            g.strokeStyle = config.strokeStyle;
            g.beginPath();
            g.arc(w/2, h/2, Math.min(w, h)/2 - config.lineWidth/2, start, start + Math.PI*3/2);
            g.stroke();
            g.closePath();

            if (this.toBorder && this.borderConfig.colour) {
                g.lineWidth = this.borderConfig.width;
                g.strokeStyle = this.borderConfig.colour;
                g.beginPath();
                g.moveTo(0, border/2);
                g.lineTo(w, border/2);
                g.moveTo(0, h - border/2);
                g.lineTo(w, h - border/2);
                g.stroke();
                g.closePath();
            }

            g.lineWidth = ps;
            this.animationConfig.start+=0.1;
        }
    ]);

    pkg.LoadingButton = Class(pkg.ActionButton, [
        function(t) {
            var $this = this,
                p = new pkg.Panel(new zebkit.layout.FlowLayout("center", "center", "horizontal", 5)),
                animationWidth;

            this.loading = false;

            this.$super(t);
            t = this.kids[0];

            this.removeAll();
            this.add(p);
            this.setFocusAnchorComponent(p);

            if (t != null) {
                p.add(t);
            }
            if (zebkit.instanceOf(t, pkg.Label)) {
                animationWidth = t.view.font.height*3/4; //circle diameter = font height
                t.extend([
                    function setFont(font) {
                        this.$super(font);
                        $this.setAnimationSize(this.view.font.height*3/4, -1);
                    }
                ])
            }
            else if (zebkit.instanceOf(t, pkg.ImagePan)) animationWidth = t.getPreferredSize().width;

            this.target = t;

            this.loadingPanel = new pkg.LoadingPanel(animationWidth, this.getPreferredSize().height, 20, true);
            p.add(this.loadingPanel);

            /**
             * Pressing button will start or stop loading animation.
             * Bind function:
             *     if (!btn.loading) {
             *         request({
             *             callback: function(res) {
             *                 if (btn.loading) {
             *                     btn.setLoading(false);
             *                     //callback
             *                 }
             *                 else {
             *                      return //interrupts callback
             *                 }
             *             }
             *         }
             *     }
             */
        },
        function setAnimationSize(w, h) {
            this.loadingPanel.setAnimationSize(w, h);
        },
        function setAnimationSpeed(s) {
            this.loadingPanel.setAnimationSpeed(s);
        },
        function setLoading(b) {
            var w = this.psWidth && this.psWidth > 0 ? this.psWidth : this.getPreferredSize().width,
                h = this.psHeight && this.psHeight > 0 ? this.psHeight : this.getPreferredSize().height;

            if (this.loading != b) {
                w += 20 * (b ? 1 : -1);
                this.setPreferredSize(w, h);
                this.loading = b;
                this.loadingPanel.setLoading(b);
            }
        },
        function pointerEntered(e) {
            this.$super(e);
            this.loadingPanel.setBackground(this.bg.activeView);
        },
        function pointerExited(e) {
            this.$super(e);
            this.loadingPanel.setBackground(this.bg.activeView);
        },
        function pointerPressed(e) {
            this.$super(e);
            this.loadingPanel.setBackground(this.bg.activeView);
        },
        function pointerReleased(e) {
            this.$super(e);
            this.loadingPanel.setBackground(this.bg.activeView);
        },
        function pointerClicked(e) {
            this.setLoading(!this.loading)
        },
        function focusGained(e) {
            this.loadingPanel.setBorderColour(this.border ? this.border.views.focuson.color : null);
            this.loadingPanel.setBorderWidth(this.border ? this.border.views.focuson.width : null);
        },
        function focusLost(e) {
            this.loadingPanel.setBorderColour(this.border ? this.border.views.focusoff.color : null);
            this.loadingPanel.setBorderWidth(this.border ? this.border.views.focusoff.width : null);
        },
        function setPreferredSize(w, h) {
            this.$super(w, h);
            this.loadingPanel.setAnimationSize(-1, h);
            this.kids[0].setPreferredSize(w, h);
        }
    ]);
});