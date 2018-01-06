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

    pkg.HoverList = Class(pkg.List, [
        function getCursorType(target,x,y){
            return (-1!=this.getItemIdxAt(x,y))?pkg.Cursor.HAND:null;
        }
    ]);

    pkg.InOutList = Class(pkg.Panel, [
        // inItems = array, of starting itmes
        // inText = text, label for in list
        // outText = text, label for out list
        function (inItems,inText,outText) {
            this.$super();

            var $this=this;

            this.inList  = new pkg.HoverList([], true);
            this.inList.extend([
                function pointerClicked(e) {
                    this.$super(e);
                    $this.handleClick(e);
                }
            ]);
            this.outList = new pkg.HoverList([], true);
            this.outList.extend([
                function pointerClicked(e) {
                    this.$super(e);
                    $this.handleClick(e);
                }
            ]);


            this.inList.setModel(new zebkit.data.ListModel(inItems));
            this.outList.provider.render.setColor(this.disabledColor);

            this.inListScroll = new this.clazz.InOutScroll(this.inList);

            this.outListScroll = new this.clazz.InOutScroll(this.outList);

            this.setLayout(new zebkit.layout.GridLayout(2, 2, "horizontal"));

            this.titlePadding = 0;

            this.inLabel = new pkg.Label(inText);
            this.outLabel = new pkg.Label(outText);

            var ctr1 = new zebkit.layout.Constraints();
            ctr1.setPadding(0, 0, 0, 20);
            ctr1.ax = "right";

            var ctr2 = new zebkit.layout.Constraints();
            ctr2.setPadding(15, 0, 0, 0);
            ctr2.ax = "right";


            var ctr5 = new zebkit.layout.Constraints();
            ctr5.setPadding(0, 20, 0, 0);
            ctr5.ax = "left";

            var ctr6 = new zebkit.layout.Constraints();
            ctr6.setPadding(15, 20, 0, 0);
            ctr6.ax = "left";


            this.add(ctr2, this.inLabel);
            this.add(ctr6, this.outLabel);
            this.add(ctr1, this.inListScroll);
            this.add(ctr5, this.outListScroll);
        },
        function handleClick(e)
        {
            var idx=e.source.getItemIdxAt(e.x,e.y);
            var $this=this;
            if (idx!=-1)
            {
                if (e.source==this.inList)
                {
                    this.outList.model.add(this.inList.model.$data[idx]);
                    this.inList.model.removeAt(idx);
                    // fix static cursor case - bind event here as model can be overwritten and need the local x+y vars
                    this.inList.model.on("elementRemoved", function(src, o, i) {
                        // getCanvas() == masv.edit.zebCtx except for when not in dashboard...
                        if (-1==$this.inList.getItemIdxAt(e.x, e.y)) $this.inList.getCanvas().element.style.cursor = "default";
                        // unbind evil to avoid creating multiple events
                        $this.inList.model._.$methods.elementRemoved.pop();
                        $this.inList.model._.$methods.elementRemoved.pop();
                    });
                }
                else if (e.source==$this.outList)
                {
                    this.inList.model.add($this.outList.model.$data[idx]);
                    this.outList.model.removeAt(idx);
                    this.outList.model.on("elementRemoved", function(src, o, i) {
                        if (-1==$this.outList.getItemIdxAt(e.x, e.y)) $this.outList.getCanvas().element.style.cursor = "default";
                        $this.outList.model._.$methods.elementRemoved.pop();
                        $this.outList.model._.$methods.elementRemoved.pop();
                    });
                }
            }
        },
        function $prototype() {
            this.disabledColor = "#CCCCCC";
        },
        function $clazz()
        {
            this.InOutScroll = Class(pkg.ScrollPan, []);
        },
        function setSize(w, h) {
            this.inListScroll.setPreferredSize((w/2)-50, h-35 - this.titlePadding);
            this.outListScroll.setPreferredSize((w/2)-50, h-35 - this.titlePadding);
            this.inLabel.setPadding(0,0,this.titlePadding,((w/2)-33)-this.inLabel.getFont().stringWidth(this.inLabel.getValue()));
            this.$super(w, h);
        },
        function setTitleFont(f) {
            this.inLabel.setFont(f);
            this.outLabel.setFont(f);
        },
        function setTitlePadding(b) {
            this.titlePadding = b;
            this.inLabel.setPadding(0, 0, b, ((this.width/2)-33)-this.inLabel.getFont().stringWidth(this.inLabel.getValue()));
            this.outLabel.setPadding(0, 0, b, 0);
        }
    ]);

    pkg.DecoratorLabel = Class(pkg.Label, [
        function(r){
            this.$hash$=zebkit.io.UID();
            this.$super();
            this.setDecoration = function(v , color){
                this.view.setDecorations(v);
                this.view.setColor(color);
            };
            this.setModel = function(m) {
                this.setView(new zebkit.draw.DecoratedTextRender(m));
            };
            this.setColor = function(c){
                if (this.view.setColor(c)){
                    this.repaint();
                    if (this.view.decorations.underline) this.view.setDecorations("underline");
                }
                return this;
            };
            this.setModel(r);
        },
        function update(g) {
            if (this.parent && this.parent.parent && this.parent.parent.hasSelection()) {
                g.setColor(this.selectionColor);

                var params=this.parent.parent.getSelectedRange(),
                    startOffset=Math.max(0,Math.min(this.width,params.start.offset-this.x)),
                    endOffset=Math.min(this.width,Math.max(0,params.end.offset-this.x)),
                    i = this.parent.parent.kids.indexOf(this.parent);

                if (i == params.minIdx && i == params.maxIdx) {
                    g.fillRect(startOffset + params.start.line.kids[0].x, 0, endOffset-startOffset, this.height);
                }
                else if (i == params.minIdx) {
                    g.fillRect(startOffset + params.start.line.kids[0].x, 0, this.width - startOffset, this.height);
                }
                else if (i == params.maxIdx) {
                    g.fillRect(params.start.line.kids[0].x, 0, endOffset, this.height);
                }
                else if (i > params.minIdx && i < params.maxIdx) {
                    g.fillRect(0, 0, this.width, this.height);
                }
            }
        }
    ]);

    pkg.hexToRGB = function(hex) {
        function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}
        function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
        function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
        function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}

        return [hexToR(hex), hexToG(hex), hexToB(hex)];
    };

    pkg.parseRgbString = function(str) {
        var rgbArr;

        if (typeof str !== "string") rgbArr = ["0", "0", "0"];
        else {
            if (str[0] == "#" && str.length == 7) rgbArr = pkg.hexToRGB(str);
            else if (str[0] == "r") {
                if (str.indexOf("rgba(") != -1) {
                    rgbArr = str.replace("rgba(", "").replace(")", "").split(",");
                    rgbArr.pop();
                }
                else if (str.indexOf("rgb") != -1) rgbArr = str.replace("rgb(", "").replace(")", "").split(",");
                else rgbArr = str.split(",");
            }
            else {
                rgbArr = str.split(",");
                if (rgbArr.length == 4) rgbArr.pop();
            }
        }

        if (rgbArr.length != 3) rgbArr = ["0", "0", "0"];
        else {
            rgbArr.some(function(v) {
                if (isNaN(Number(v)) || v < 0 || v > 255) {
                    rgbArr = ["0", "0", "0"];
                    return true;
                }
            });
        }

        return rgbArr;
    };


    pkg.TextEditor = Class(pkg.Panel,[
        function(layout, json_text, width, height)
        {
            this.$super(layout);

            this.prefWidth=width;
            this.scrollHeight=height;
            this.scrollPan = new pkg.ScrollPan(this,"vertical");
            this.scrollPan.setPreferredSize(width, height);

            this.setBackground('rgba(255,255,255,0)');
            this.setLayout(new zebkit.layout.ListLayout("stretch",0));
            this.$hash$=zebkit.io.UID();

            this.blinkingPeriod = 500;
            this.blinkMe        = true;
            this.blinkMeCounter = 0;
            this.isEditable     = true;
            this.focusLine     = null;
            this.focusLabel     = null;
            this.focusOffset    = -1;
            this.cursorType = pkg.Cursor.TEXT;

            this.startPosition = {};
            this.endPosition = {};
            this.isShiftDown = false;

            this.canHaveFocus = true;

            this.defaultSize=16;
            this.defaultFont='Helvetica';
            this.defaultColor='#000000';
            this.defaultBackground='rgba(255,255,255,0)';
            this.defaultBold=false;
            this.defaultItalic=false;
            this.defaultUnderline=false;
            this.defaultAlign="left";

            this.selectedSize=this.defaultSize;
            this.selectedFont=this.defaultFont;
            this.selectedColor=this.defaultColor;
            this.selectedBackground=this.defaultBackground;
            this.selectedBold=this.defaultBold;
            this.selectedItalic=this.defaultItalic;
            this.selectedUnderline=this.defaultUnderline;
            this.selectedAlign=this.defaultAlign;

            this.selectionRendered=false;

            this.makeContent(json_text);

            this.history=[this.historyObj(this.kids.length-1,this.getOffsetIndex(this.focusLine, this.focusOffset),0,json_text)];
            this.historyIdx=0;

            var EventDispatcher =function(){
                // Create a dummy DOM element
                var dummy = document.createTextNode('');

                // Create custom wrappers with nicer names
                this.off = dummy.removeEventListener.bind(dummy);
                this.on = dummy.addEventListener.bind(dummy);
                this.trigger = function(eventName, obj){
                    if( !eventName ) return;
                    var e = new CustomEvent(eventName, {"detail":obj});
                    dummy.dispatchEvent(e);
                }
            };
            this.eventDispatcher = new EventDispatcher();
        },
        function labelValues(label)
        {
            if (label==null && this.focusOffset==-1)
            {
                if (this.focusLine!=null)
                {
                    label=this.focusLine.kids[this.focusLine.kids.length-1];
                }
                else if (this.kids.length>0)
                {
                    label=this.kids[this.kids.length-1].kids[this.focusLine.kids.length-1];
                }
                else return null;
            }
            var font=label.getFont();
            var fontParts=font.s.split(' ');

            return {
                name: font.family,
                size: font.realSize,
                bold: fontParts.indexOf('bold')!=-1,
                italic: fontParts.indexOf('italic')!=-1,
                underline: font.underline,
                align: (label.parent==null?"left":label.parent.layout.ax),
                color: label.getColor(),
                background: ((label.bg && label.bg.s)?label.bg.s:this.defaultBackground)
            };
        },
        function currentValues()
        {
            return {
                name: this.selectedFont,
                size: this.selectedSize,
                bold: this.selectedBold,
                italic: this.selectedItalic,
                underline: this.selectedUnderline,
                align: this.selectedAlign,
                color: this.selectedColor,
                background: this.selectedBackground
            };
        },
        function compareLabels(labelOld, labelNew)
        {
            if (labelOld==null && labelNew==null) return;
            if (labelOld==null)
            {
                this.eventDispatcher.trigger('labelChange',this.labelValues(labelNew));
            }
            else
            {
                var labelValues=this.labelValues(labelNew);
                if (JSON.stringify(this.labelValues(labelOld)) !== JSON.stringify(labelValues)) {
                    this.eventDispatcher.trigger('labelChange', labelValues);
                }
            }
        },
        function fontFromValue(item)
        {
            var currentStyle='';
            if (item.bold) currentStyle+='bold';
            if (item.italic) currentStyle+=' italic';
            currentStyle=currentStyle.trim();

            var font = new zebkit.Font(item.name,currentStyle,(item.size?item.size:this.defaultSize));
            font.realSize=item.size?item.size:this.defaultSize;
            font.underline=item.underline?true:false;

            return font;
        },
        function fontFromCurrent()
        {
            var currentStyle='';
            if (this.selectedBold) currentStyle+='bold';
            if (this.selectedItalic) currentStyle+=' italic';
            currentStyle=currentStyle.trim();

            var font = new zebkit.Font(this.selectedFont,currentStyle,this.selectedSize);
            font.realSize=this.selectedSize;
            font.underline=this.selectedUnderline?true:false;

            return font;
        },
        function historyObj(lineIdx, offIdx, currentScrollY, text)
        {
            return {
                lineIdx: lineIdx,
                offIdx: offIdx,
                currentScrollY: currentScrollY,
                text: text
            };
        },
        function catchInput(c) {
            return true;
        },
        function paintOnTop(g) {
            if (this.focusLine && this.focusLine.kids.length>0 && this.blinkMe && this.isEditable)
            {
                g.setColor("black");
                g.lineWidth = 1;
                var focusLabel=this.focusLabel;
                if (focusLabel==null || this.focusOffset==-1)
                {
                    this.focusOffset=-1;
                    if (!this.focusLine.realLine)
                    {
                        this.focusLine=this.getNextRealLine(this.focusLine);
                        if (this.focusLine.kids.length==0) return;
                    }
                    var lastIndex=this.focusLine.kids.length-1;
                    focusLabel=this.focusLine.kids[lastIndex];
                    while (lastIndex>0 && focusLabel.view.target=='')
                    {
                        lastIndex--;
                        focusLabel=this.focusLine.kids[lastIndex];
                    }
                    g.drawLine(this.focusLine.kids[0].x+this.lineWidth(this.focusLine),this.focusLine.y+focusLabel.getTop(),this.focusLine.kids[0].x+this.lineWidth(this.focusLine),this.focusLine.y+this.focusLine.getPreferredSize().height);
                }
                else
                {
                    g.drawLine(this.focusLine.kids[0].x+this.focusOffset,this.focusLine.y+focusLabel.getTop(),this.focusLine.kids[0].x+this.focusOffset,this.focusLine.y+this.focusLabel.getPreferredSize().height);
                }

                g.stroke();
            }
        },
        function update(g) {
            if (this.hasSelection()) {
                this.selectionRendered=true;
            }
            else this.selectionRendered=false;
        },
        function nextLabel(label)
        {
            var line=label.parent;

            var labelIndex=line.kids.indexOf(label);
            if (labelIndex+1<line.kids.length) return line.kids[labelIndex+1];

            var lineIndex=this.kids.indexOf(line);
            if (lineIndex+1<this.kids.length) return this.kids[lineIndex+1].kids[0];

            return null;
        },
        function prevLabel(label)
        {
            var line=label.parent;

            var labelIndex=line.kids.indexOf(label);
            if (labelIndex>0) return line.kids[labelIndex-1];

            var lineIndex=this.kids.indexOf(line);
            if (lineIndex>0) return this.kids[lineIndex-1].kids[this.kids[lineIndex-1].kids.length-1];

            return null;
        },
        function pointerDoubleClicked(e)
        {
            // using abs figures to avoid scrollPan update bug with mousewheel
            var compAt = this.getCanvas().root.getComponentAt(e.absX,e.absY);//this.getComponentAt(e.x,e.y);

            if (zebkit.instanceOf(compAt, pkg.Label) && compAt.parent.parent.$hash$==this.$hash$)
            {
                var offset = this.getOffset(this.focusLine,e.x-this.focusLine.kids[0].x);
                if (offset>-1)
                {
                    this.focusOffset=offset;
                    this.startSelection();

                    var labelOffset=0;
                    var preOffset=offset;
                    var context=this;

                    for (var i=0;i<this.focusLine.kids.length;i++)
                    {
                        var label = this.focusLine.kids[i];
                        var text = label.getValue();
                        var labelWidth = label.getFont().stringWidth(text);

                        if (preOffset>labelWidth) preOffset-=labelWidth;
                        else
                        {
                            if (preOffset==labelWidth && i<this.focusLine.kids.length-1)
                            {
                                this.endPosition.label=this.focusLine.kids[i+1];
                                labelOffset=0;
                                break;
                            }

                            labelOffset=preOffset;
                            break;
                        }
                    }

                    var indexAtAlphaNumeric = function(label,x, backwards)
                    {
                        var index=context.charIndexAtLabelOffset(label,x);
                        if (index==-1) return -1;

                        var labelText=label.getValue();
                        if (backwards)
                        {
                            index=labelText.length-(index+1);
                            if (index==-1) return -1;
                            if (index<labelText.length && labelText[index].match(/^[a-z0-9]+$/i))
                            {
                                return index;
                            }
                            else return -1;
                        }
                        else if (index<labelText.length)
                        {
                            if (labelText[index].match(/^[a-z0-9]+$/i)) return index;
                            else return -1;
                        }
                        else return -1;
                    }


                    var startOffset=labelOffset;
                    var subStartOffset=this.endPosition.offset-labelOffset;
                    var startIndex=indexAtAlphaNumeric(this.endPosition.label,labelOffset);
                    var labelIndex=startIndex;
                    while (labelIndex>-1)
                    {
                        while (labelIndex>-1)
                        {
                            labelWidth=this.endPosition.label.getFont().stringWidth(this.endPosition.label.getValue());
                            if (labelOffset<labelWidth)
                            {
                                labelIndex+=this.endPosition.label.getValue().substring(labelIndex,labelWidth).match(/^[a-z0-9]+/i)[0].length;

                                var charOffset=this.endPosition.label.getFont().stringWidth(this.endPosition.label.getValue().substring(0,labelIndex));
                                this.endPosition.offset=subStartOffset+charOffset;
                                labelOffset=charOffset;
                            }

                            if (labelOffset>=labelWidth) break;

                            labelIndex=indexAtAlphaNumeric(this.endPosition.label,labelOffset);
                        }
                        if (labelIndex>0)
                        {
                            label=this.nextLabel(this.endPosition.label);
                            if (label==null) break;
                            if (label.getValue()=='') break;
                            if (this.endPosition.line.realLine===true && this.endPosition.line.$hash$!=label.parent.$hash$) break;

                            labelIndex=0;
                            labelOffset=0;
                            subStartOffset=this.endPosition.offset;
                            this.endPosition.label=label;
                            if (label.parent.$hash$!=this.endPosition.line.$hash$)
                            {
                                subStartOffset=0;
                                this.endPosition.line=label.parent;
                                this.endPosition.offset=0;
                            }
                            labelIndex=indexAtAlphaNumeric(this.endPosition.label,labelOffset);
                        }
                        else labelIndex=-1;
                    }

                    labelOffset=startOffset;
                    labelIndex=startIndex;
                    subStartOffset=this.startPosition.offset-labelOffset;
                    label=this.startPosition.label;

                    while (labelIndex>-1)
                    {
                        while (labelIndex>-1)
                        {
                            var match=this.startPosition.label.getValue().substring(0, labelIndex+(labelIndex==0?1:0)).split('').reverse().join('').match(/^[a-z0-9]+/i);
                            if (match==null)
                            {
                                break;
                            }

                            labelIndex-=match[0].length;
                            if (labelIndex==-1) labelIndex=0;

                            charOffset=this.startPosition.label.getFont().stringWidth(this.startPosition.label.getValue().substring(0,labelIndex));
                            this.startPosition.offset=subStartOffset+charOffset;
                            labelOffset=charOffset;

                            if (labelOffset<1) break;

                            labelIndex=indexAtAlphaNumeric(this.startPosition.label,labelOffset);
                        }
                        if (labelIndex==0)
                        {
                            var preLabel=this.prevLabel(label);
                            if (preLabel==null) break;
                            if (preLabel.getValue()=='') break;
                            if (preLabel.parent.realLine===true && this.startPosition.line.$hash$!=preLabel.parent.$hash$) break;

                            labelIndex=0;
                            labelOffset=0;
                            subStartOffset-=preLabel.getFont().stringWidth(preLabel.getValue());
                            labelIndex=indexAtAlphaNumeric(preLabel,labelOffset,true);
                            if (labelIndex!=-1)
                            {
                                label=preLabel;
                                this.startPosition.label=label;
                                if (label.parent.$hash$!=this.startPosition.line.$hash$)
                                {
                                    this.startPosition.line=label.parent;
                                    this.startPosition.offset=this.lineWidth(this.startPosition.line);
                                    subStartOffset=this.startPosition.offset-preLabel.getFont().stringWidth(preLabel.getValue());
                                }
                            }
                        }
                        else labelIndex=-1;
                    }

                    var prevFocusLabel=this.focusLabel;
                    this.focusLabel=this.endPosition.label;
                    this.compareLabels(prevFocusLabel, this.focusLabel);

                    this.focusLine=this.endPosition.line;
                    this.focusOffset=this.endPosition.offset;
                    this.repaint();
                    return;
                }
            }
        },
        function pointerPressed(e)
        {
            // using abs figures to avoid scrollPan update bug with mousewheel
            var compAt = this.getCanvas().root.getComponentAt(e.absX,e.absY);//this.getComponentAt(e.x,e.y);
            var prevFocusLabel=this.focusLabel;
            this.focusLabel = null;
            this.focusOffset = -1;
            if (zebkit.instanceOf(compAt, pkg.Label) && compAt.parent.parent.$hash$==this.$hash$)
            {
                this.focusLabel=compAt;
                this.focusLine=compAt.parent;
                this.focusOffset=this.getOffset(this.focusLine,e.x-this.focusLine.kids[0].x);

                this.clearSelection();
            }
            else if (compAt!=null && compAt.kids.length>0)
            {
                if (zebkit.instanceOf(compAt.kids[0], pkg.Label) && compAt.parent.$hash$==this.$hash$)
                {
                    this.focusLine=compAt;
                }
                else if (this.kids.length>0) this.focusLine=this.kids[this.kids.length-1];
                else this.focusLine = null;

                this.clearSelection();
            }

            if (this.focusLabel!=null) this.compareLabels(prevFocusLabel, this.focusLabel);

            this.repaint();
        },
        function isFiltered(e){
            var code = e.code;
            var KE = zebkit.ui.event.KeyEvent;
            return code === KE.SHIFT || code === KE.CTRL ||
                code === KE.TAB   || code === KE.ALT  ||
                (e.mask & KE.M_ALT) > 0;
        },
        function startSelection() {
            var offset=this.focusOffset==-1?this.lineWidth(this.focusLine):this.focusOffset;

            this.startPosition = {
                line: this.focusLine,
                label: this.focusLabel,
                offset: offset
            };
            this.endPosition = {
                line: this.focusLine,
                label: this.focusLabel,
                offset: offset
            };
        },
        function clearSelection() {
            if (this.focusLine) this.startSelection();
            this.repaint();
        },
        function hasSelection() {
            if (this.startPosition.line==null) return false;
            if (this.endPosition.line==null) return false;

            return (this.startPosition.line.$hash$ !=this.endPosition.line.$hash$ ||
            this.startPosition.offset!=this.endPosition.offset);
        },
        function removeSelected()
        {
            var params=this.getSelectedRange();
            var prevFocusLabel=this.focusLabel;

            this.focusLabel=params.start.label;
            this.focusLine=params.start.line;
            this.focusOffset=params.start.offset;

            var started = false;
            var allOneRealLine=false;

            if (params.end.label==null)
            {
                if (this.lineWidth(params.end.line)==params.end.offset || params.end.offset==-1)
                {
                    params.end.label=this.kids[params.maxIdx].kids[this.kids[params.maxIdx].kids.length-1]
                }
                else if (params.maxIdx>params.minIdx)
                {
                    params.end.label=this.kids[params.maxIdx].kids[0];
                }
                else return; // ?
            }
            if (params.start.label==null)
            {
                params.start.label=this.kids[params.minIdx].kids[0];
            }

            for (var i=params.minIdx;i<=params.maxIdx;i++)
            {
                var xPos=0;

                for (var ii=0;ii<this.kids[i].kids.length;ii++)
                {
                    var label = this.kids[i].kids[ii];

                    if (label.$hash$==params.start.label.$hash$ && label.$hash$==params.end.label.$hash$)
                    {
                        var startIdx=this.charIndexAtLabelOffset(label,params.start.offset-xPos);
                        var endIdx=this.charIndexAtLabelOffset(label,params.end.offset-xPos);
                        var text=label.getValue();

                        label.setValue(text.substring(0,startIdx)+text.substring(endIdx,text.length));

                        if (label.getValue()=='')
                        {
                            if (this.focusLine.kids.length>1) {
                                this.focusLabel = this.prevLabel(label);
                                if (this.focusLabel) this.focusLine = this.focusLabel.parent;

                                label.removeMe();
                                ii--;
                            }
                        }
                        if (params.start.line.realLine && this.lineWidth(params.start.line)<this.prefWidth-13) allOneRealLine=true;
                        break;
                    }
                    else if (label.$hash$==params.start.label.$hash$)
                    {
                        var index=this.charIndexAtLabelOffset(label,params.start.offset-xPos);
                        xPos+=label.getFont().stringWidth(label.getValue());
                        if (label.getValue()!='')
                        {
                            label.setValue(label.getValue().substring(0,index));
                            if (label.getValue()=='')
                            {
                                this.focusLabel= this.prevLabel(label);
                                if (this.focusLabel) this.focusLine=this.focusLabel.parent;

                                label.removeMe();
                                ii--;
                            }
                        }
                        started=true;
                    }
                    else if (label.$hash$==params.end.label.$hash$)
                    {
                        index=this.charIndexAtLabelOffset(label,params.end.offset-xPos);
                        label.setValue(label.getValue().substring(index,label.getValue().length));
                        if (label.getValue()=='')
                        {
                            label.removeMe();
                            ii--;
                        }
                        break;
                    }
                    else if (started)
                    {
                        xPos+=label.getFont().stringWidth(label.getValue());
                        label.removeMe();
                        ii--;
                    }
                    else
                    {
                        xPos+=label.getFont().stringWidth(label.getValue());
                    }
                }
            }

            this.clearSelection();
            this.makeHistory(this.getOffsetIndex(this.focusLine, this.focusOffset),params.minIdx);

            if (!allOneRealLine) {
                this.historyRefresh(this.historyIdx);
            }

            if (this.focusLabel!=null) this.compareLabels(prevFocusLabel, this.focusLabel);

            this.repaint();
        },
        function historyRefresh(historyIdx)
        {
            this.removeAll();

            var historyObj=this.history[historyIdx],
                lineIdx=historyObj.lineIdx, offIdx=historyObj.offIdx;

            this.makeContent(this.history[historyIdx].text);

            for (var i = 0; i < this.kids.length; i++) {
                if (i == lineIdx) {
                    this.focusLine = this.kids[i];

                    var prevLine=this.getPrevLine(this.focusLine);

                    if (!prevLine.realLine)
                    {
                        while(!prevLine.realLine)
                        {
                            if (this.getPrevLine(prevLine).$hash$==prevLine.$hash$) break;
                            prevLine=this.getPrevLine(prevLine);
                        }
                        if (prevLine.realLine) prevLine=this.getNextLine(prevLine);
                        this.focusLine=prevLine;
                    }


                    while (offIdx>this.lineChars(this.focusLine))
                    {
                        offIdx-=this.lineChars(this.focusLine);
                        if (this.kids.indexOf(this.focusLine)==this.kids.length-1) break;
                        this.focusLine=this.getNextLine(this.focusLine);
                    }
                    this.focusOffset=0;
                    this.focusLabel = null;
                    for (var ii=0;ii<this.focusLine.kids.length;ii++)
                    {
                        var label=this.focusLine.kids[ii];
                        var labelValue=label.getValue();

                        if (offIdx>labelValue.length)
                        {
                            offIdx-=labelValue.length;
                            this.focusOffset+=label.getFont().stringWidth(labelValue);
                        }
                        else
                        {
                            this.focusOffset+=label.getFont().stringWidth(labelValue.substring(0,offIdx));
                            this.focusLabel=label;
                            break;
                        }
                    }

                    break;
                }
            }

            if (zebkit.instanceOf(this.parent.parent,pkg.ScrollPan) && this.isEditable) {
                var context=this;
                window.requestAnimationFrame(function () {
                    context.parent.parent.scrollObj.scrollManager.scrollYTo(Math.min(context.height - context.parent.parent.height, historyObj.currentScrollY*-1) * -1);
                });
            }

            this.repaint();
        },
        function keyPressed(e)
        {
            if (this.isFiltered(e) === false) {
                var KE = zebkit.ui.event.KeyEvent;
                var cursorChange=false, backSearch = false;

                if (!this.isShiftDown && e.shiftKey && e.key=="Shift") {
                    this.isShiftDown=true;
                    this.startSelection();
                }


                if (this.focusLine == null) return;

                var prevFocusLabel=this.focusLabel;
                var index = this.getOffsetIndex(this.focusLine, this.focusOffset);

                var sp=null;

                if (zebkit.instanceOf(this.parent.parent,pkg.ScrollPan)) {
                    sp=this.parent.parent;
                }

                switch (e.code) {
                    case "ArrowDown" :

                        this.clearSelection();

                        var origLine=this.focusLine;

                        var nextLine = this.getNextLine(this.focusLine);

                        if (nextLine.$hash$==this.focusLine.$hash$)
                        {
                            this.focusLine=origLine;
                            return;
                        }

                        if (!this.focusLine.realLine)
                        {
                            while (!nextLine.realLine) {
                                if (nextLine.$hash$==this.getNextLine(nextLine).$hash$)
                                {
                                    this.focusLine=origLine;
                                    return;
                                }
                                this.focusLine=nextLine;
                                nextLine = this.getNextLine(nextLine);
                            }
                            if (nextLine.$hash$==this.getNextLine(nextLine).$hash$)
                            {
                                this.focusLine=origLine;
                                return;
                            }
                            nextLine = this.getNextLine(nextLine);
                        }


                        this.focusLine=nextLine;


                        while (!this.focusLine.realLine && index > this.lineChars(this.focusLine)) {
                            index -= this.lineChars(this.focusLine);
                            this.focusLine = this.getNextLine(this.focusLine);
                        }

                        if (this.lineChars(this.focusLine)==0) index = 0;

                        if (sp){
                            if (sp.scrollObj.scrollManager.getSY()+this.focusLine.y>=sp.height-this.focusLine.height ||
                                this.focusLine.y<sp.scrollObj.scrollManager.getSY()*-1)
                            {
                                sp.scrollObj.scrollManager.scrollYTo(Math.max(this.focusLine.y-sp.height+this.focusLine.height,0)*-1);
                            }
                        }
                        cursorChange=true;

                        break;
                    case "ArrowUp"  :

                        this.clearSelection();

                        origLine=this.focusLine;

                        if (!this.getPrevLine(this.focusLine).realLine)
                        {
                            var prevLine = this.getPrevLine(this.focusLine);
                            while (!prevLine.realLine) {
                                if (prevLine.$hash$==this.getPrevLine(prevLine).$hash$)
                                {
                                    this.focusLine=origLine;
                                    return;
                                }
                                this.focusLine=prevLine;
                                prevLine = this.getPrevLine(prevLine);
                            }

                        }

                        prevLine = this.getPrevLine(this.focusLine);
                        if (prevLine.$hash$==this.focusLine.$hash$)
                        {
                            this.focusLine=origLine;
                            return;
                        }

                        this.focusLine=prevLine;

                        prevLine = this.getPrevLine(this.focusLine);

                        while (!prevLine.realLine) {
                            this.focusLine=prevLine;

                            prevLine = this.getPrevLine(prevLine);
                            if (prevLine.$hash$==this.focusLine.$hash$) break;
                        }


                        while (index > this.lineChars(this.focusLine) && !this.focusLine.realLine) {
                            index -= this.lineChars(this.focusLine);
                            this.focusLine = this.getNextLine(this.focusLine);
                        }

                        if (this.lineChars(this.focusLine)==0) index = 0;

                        if (sp.scrollObj.scrollManager.getSY()+this.focusLine.y>=sp.height-this.focusLine.height ||
                            this.focusLine.y<sp.scrollObj.scrollManager.getSY()*-1)
                        {
                            sp.scrollObj.scrollManager.scrollYTo(Math.max(this.focusLine.y,0)*-1);
                        }

                        cursorChange=true;

                        break;
                    case "ArrowLeft" :

                        this.clearSelection();

                        index=this.keyLeft(index);
                        cursorChange=true;

                        break;
                    case "ArrowRight" :

                        this.clearSelection();

                        if (this.focusOffset == -1) {
                            nextLine=this.getNextLine(this.focusLine);
                            if (nextLine.$hash$!=this.focusLine.$hash$) {
                                index = 0;
                                this.focusLine = nextLine;
                            }
                        }
                        else {
                            index++;

                            prevLine = this.getPrevLine(this.focusLine);
                            var len=this.lineChars(this.focusLine);
                            var totalLen=len;
                            backSearch = false;
                            while (!prevLine.realLine) {
                                backSearch = true;
                                if (prevLine.$hash$ != this.focusLine.$hash$) totalLen+=this.lineChars(prevLine);
                                if (prevLine.$hash$ == this.getPrevLine(prevLine).$hash$) break;
                                prevLine = this.getPrevLine(prevLine);
                            }

                            if (index>totalLen)
                            {
                                nextLine = this.getNextLine(this.focusLine);

                                if (this.focusLine.$hash$==nextLine.$hash$)
                                {
                                    index--;
                                }
                                else
                                {
                                    index=0;
                                    this.focusLine=nextLine;
                                }
                            }
                            else if (backSearch) {
                                totalLen-=len;
                                index-=totalLen;
                            }
                        }
                        cursorChange=true;

                        break;
                    case "End" :

                        this.clearSelection();

                        while (!this.focusLine.realLine) {
                            this.focusLine = this.getNextLine(this.focusLine);
                        }
                        index = this.lineChars(this.focusLine);
                        if (sp){
                            if (sp.scrollObj.scrollManager.getSY()+this.focusLine.y>=sp.height-this.focusLine.height ||
                                this.focusLine.y<sp.scrollObj.scrollManager.getSY()*-1)
                            {
                                sp.scrollObj.scrollManager.scrollYTo(Math.max(this.focusLine.y-sp.height+this.focusLine.height,0)*-1);
                            }
                        }

                        cursorChange=true;

                        break;
                    case "Home" :

                        this.clearSelection();

                        prevLine = this.getPrevLine(this.focusLine);
                        while (!prevLine.realLine) {
                            this.focusLine = prevLine;
                            if (prevLine.$hash$ == this.getPrevLine(prevLine).$hash$) break;
                            prevLine = this.getPrevLine(prevLine);
                        }

                        index = 0;
                        if (sp.scrollObj.scrollManager.getSY()+this.focusLine.y>=sp.height-this.focusLine.height ||
                            this.focusLine.y<sp.scrollObj.scrollManager.getSY()*-1)
                        {
                            sp.scrollObj.scrollManager.scrollYTo(Math.max(this.focusLine.y,0)*-1);
                        }

                        cursorChange=true;

                        break;
                    case "PageDown" :

                        this.clearSelection();

                        this.focusLine = this.kids[this.kids.length - 1];

                        backSearch = false;

                        prevLine = this.getPrevLine(this.focusLine);
                        while (!prevLine.realLine) {
                            this.focusLine = prevLine;
                            backSearch = true;
                            prevLine = this.getPrevLine(prevLine);
                        }

                        if (backSearch) {
                            while (index >= this.lineChars(this.focusLine)) {
                                index -= this.lineChars(this.focusLine);
                                nextLine=this.getNextLine(this.focusLine);
                                if (nextLine.$hash$==this.focusLine.$hash$)
                                {
                                    index=-1;
                                    break;
                                }
                                else this.focusLine = nextLine;
                            }
                        }
                        if (sp){
                            if (sp.scrollObj.scrollManager.getSY()+this.focusLine.y>=sp.height-this.focusLine.height ||
                                this.focusLine.y<sp.scrollObj.scrollManager.getSY()*-1)
                            {
                                sp.scrollObj.scrollManager.scrollYTo(Math.max(this.focusLine.y-sp.height+this.focusLine.height,0)*-1);
                            }
                        }

                        cursorChange=true;

                        break;
                    case "PageUp" :

                        this.clearSelection();

                        this.focusLine = this.kids[0];

                        if (!this.focusLine.realLine) {
                            while (index >= this.lineChars(this.focusLine)) {
                                index -= this.lineChars(this.focusLine);
                                this.focusLine = this.getNextLine(this.focusLine);
                            }
                        }

                        if (sp.scrollObj.scrollManager.getSY()+this.focusLine.y>=sp.height-this.focusLine.height ||
                            this.focusLine.y<sp.scrollObj.scrollManager.getSY()*-1)
                        {
                            sp.scrollObj.scrollManager.scrollYTo(Math.max(this.focusLine.y,0)*-1);
                        }

                        cursorChange=true;

                        break;
                    case "Delete" :
                        if (this.isEditable) {
                            if (this.hasSelection()) this.removeSelected();
                            else {
                                this.deleteChar();
                            }
                        }
                        break;
                    case "Backspace" :
                        if (this.isEditable) {
                            if (this.hasSelection()) this.removeSelected();
                            else {
                                index=this.keyLeft(index);
                                var offCalc = this.getOffsetFromIndex(this.focusLine, index);
                                this.focusLabel = offCalc.label;
                                this.focusOffset = offCalc.offset;

                                this.deleteChar();
                            }
                        }
                        break;
                    case "Enter" :
                        if (this.isEditable) {
                            var focusLineIdx = this.getSelectedRange().minIdx;

                            if (this.hasSelection()) this.removeSelected();
                            if (-1 == focusLineIdx) focusLineIdx = this.kids.indexOf(this.focusLine);

                            var newLine = this.makeLine();
                            newLine.setLayout(new zebkit.layout.FlowLayout(this.focusLine.layout.ax, "top", "horizontal", 0));

                            var lineWidth = this.lineWidth(this.focusLine);
                            var newLabel;

                            if (this.endPosition.offset < lineWidth || (!this.focusLine.realLine && this.endPosition.offset == lineWidth && lineWidth != 0)) {
                                var charIndex = this.labelCharIndexAtLineOffset();
                                var value = this.focusLabel.getValue();

                                this.focusLabel.setValue(value.substring(0, charIndex));

                                newLabel = this.cloneLabel(this.focusLabel);
                                newLabel.setValue(value.substring(charIndex, value.length));

                                newLine.add(newLabel);

                                for (var i = this.focusLine.indexOf(this.focusLabel) + 1; i < this.focusLine.kids.length; i++) {
                                    var label = this.focusLine.kids[i];
                                    label.removeMe();
                                    i--;
                                    newLine.add(label);
                                }
                            }
                            else {
                                var endLabel = this.endPosition.line.kids[this.endPosition.line.kids.length - 1];

                                newLabel = this.cloneLabel(endLabel);
                                newLine.add(newLabel);
                            }


                            this.insert(focusLineIdx + 1, this.focusLine.constraints, newLine);
                            newLine.realLine = this.focusLine.realLine;
                            this.focusLine.realLine = true;

                            var oldLine = this.focusLine;

                            this.focusLine = newLine;
                            this.focusOffset = 0;
                            this.focusLabel = newLabel;

                            this.clearSelection();
                            this.makeHistory(this.getOffsetIndex(this.focusLine, this.focusOffset), focusLineIdx + 1);

                            if (!newLine.realLine) {
                                this.historyRefresh(this.historyIdx);
                            }
                            else {
                                this.adjustLinePadding(oldLine);
                                this.adjustLinePadding(newLine);
                                this.resetHeight();

                                if (sp){
                                    var scrollTo=Math.max(oldLine.y-sp.height+(oldLine.height*2),0);
                                    var currScroll=sp.scrollObj.scrollManager.getSY()*-1;
                                    if (scrollTo>currScroll)
                                    {
                                        sp.scrollObj.scrollManager.scrollYTo(scrollTo*-1);
                                    }
                                }
                            }
                        }
                        break;
                    default:
                        if (e.ctrlKey)
                        {
                            switch (e.code) {
                                case "KeyA":
                                    //CTRL-A
                                    if (this.kids.length>0 && this.kids[0].kids.length>0) {
                                        this.startPosition = {
                                            line: this.kids[0],
                                            label: this.kids[0].kids[0],
                                            offset: 0
                                        };
                                        this.endPosition = {
                                            line: this.kids[this.kids.length - 1],
                                            label: this.kids[this.kids.length - 1].kids[this.kids[this.kids.length - 1].kids.length - 1],
                                            offset: this.lineWidth(this.kids[this.kids.length - 1])
                                        };
                                        this.focusLabel = this.endPosition.label;
                                        this.focusLine = this.endPosition.line;
                                        this.focusOffset = this.endPosition.offset;

                                        index = -1;

                                        cursorChange = true;
                                    }
                                    break;
                                case "KeyY":
                                    //CTRL-Y
                                    this.performRedo();
                                    return;
                                case "KeyZ":
                                    //CTRL-Z
                                    this.performUndo();
                                    return;
                                default:
                                    return;
                            }
                        }
                        else return;
                }

                if (cursorChange)
                {
                    var off = this.getOffsetFromIndex(this.focusLine, index);
                    this.focusLabel = off.label;
                    this.focusOffset = off.offset;

                    this.requestFocus();

                    if (this.isShiftDown)
                    {
                        this.endPosition.line=this.focusLine;
                        this.endPosition.label=this.focusLabel;
                        this.endPosition.offset=this.focusOffset;
                    }
                }

                if (!e.ctrlKey && this.isShiftDown)
                {
                    if (!(e.shiftKey)) {
                        this.isShiftDown=false;
                        this.clearSelection();
                    }
                }

                if (this.focusLabel!=null) this.compareLabels(prevFocusLabel, this.focusLabel);

            }

            this.repaint();
        },
        function performUndo()
        {
            if (this.focusLine == null) return;
            if (this.historyIdx<1) return;

            var prevFocusLabel=this.focusLabel;

            this.clearSelection();
            this.historyIdx--;

            this.historyRefresh(this.historyIdx);
            if (this.focusLabel!=null) this.compareLabels(prevFocusLabel, this.focusLabel);
            this.repaint();
            this.eventDispatcher.trigger('historyChange', this.historyIdx);
        },
        function performRedo()
        {
            if (this.focusLine == null) return;
            if (this.historyIdx>=this.history.length-1) return;

            var prevFocusLabel=this.focusLabel;

            this.clearSelection();
            this.historyIdx++;

            this.historyRefresh(this.historyIdx);
            if (this.focusLabel!=null) this.compareLabels(prevFocusLabel, this.focusLabel);
            this.repaint();
            this.eventDispatcher.trigger('historyChange', this.historyIdx);
        },
        function keyTyped(e) {
            if (this.isEditable === true && e.ctrlKey == false && e.metaKey == false && e.key!='\n' && this.kids.length>0) {

                if (this.focusLine==null) this.focusLine=this.kids[this.kids.length-1];

                var focusLineIdx=this.getSelectedRange().minIdx;

                if (this.hasSelection()) this.removeSelected();
                if (-1==focusLineIdx) focusLineIdx=this.kids.indexOf(this.focusLine);
                if (null==this.focusLabel) this.focusLabel=this.endPosition.line.kids[this.endPosition.line.kids.length-1];

                var charIndex, value = this.focusLabel.getValue();

                if (this.focusOffset==-1) charIndex = value.length;
                else charIndex = this.labelCharIndexAtLineOffset();

                this.clearSelection();

                var labelValues=this.labelValues(this.focusLabel);
                var labelChange=true;

                if (this.selectedFont===labelValues.name && this.selectedSize===labelValues.size && this.selectedColor===labelValues.color &&
                    this.selectedBackground===labelValues.background && this.selectedBold===labelValues.bold && this.selectedItalic===labelValues.italic &&
                    this.selectedUnderline===labelValues.underline && this.selectedAlign===labelValues.align)
                {
                    labelChange=false;
                    this.focusLabel.setValue(value.substring(0, charIndex)+e.key+value.substring(charIndex, value.length));
                }
                else
                {
                    this.focusLabel.setValue(value.substring(0, charIndex));

                    var label=new pkg.DecoratorLabel(e.key);
                    label.setFont(this.fontFromCurrent());
                    if (this.selectedColor) label.setColor(this.selectedColor);
                    if (this.selectedBackground) label.setBackground(this.selectedBackground);
                    if (this.selectedUnderline) label.setDecoration('underline', label.getColor());

                    this.focusLine.insert(this.focusLine.kids.indexOf(this.focusLabel)+1,this.focusLabel.constraints,label);

                    label=new pkg.DecoratorLabel(value.substring(charIndex, value.length));
                    label.setFont(this.fontFromValue(labelValues));
                    if (labelValues.color) label.setColor(labelValues.color);
                    if (labelValues.background) label.setBackground(labelValues.background);
                    if (labelValues.underline) label.setDecoration('underline', label.getColor());

                    this.focusLine.insert(this.focusLine.kids.indexOf(this.focusLabel)+2,this.focusLabel.constraints,label);
                }
                this.focusOffset=this.getOffsetFromIndex(this.focusLine,this.getOffsetIndex(this.focusLine, this.focusOffset, true)+1).offset;
                this.focusLabel.invalidate();

                this.makeHistory(this.getOffsetIndex(this.focusLine, this.focusOffset),focusLineIdx);

                if (labelChange || !this.focusLine.realLine || this.lineWidth(this.focusLine)>this.prefWidth-13) {
                    this.historyRefresh(this.historyIdx);
                }
                else
                {
                    this.adjustLinePadding(this.focusLine);
                    //this.resetHeight();
                }
            }
        },
        function makeHistory(index,focusLineIdx)
        {
            var currentScrollY=0;

            if (zebkit.instanceOf(this.parent.parent,pkg.ScrollPan)) {
                currentScrollY=this.parent.parent.scrollObj.scrollManager.getSY();
            }

            var historyObj=this.historyObj(focusLineIdx,index,currentScrollY,this.makeJsonText());

            this.historyIdx++;
            if (this.historyIdx==this.history.length) {
                this.history.push(historyObj);
            }
            else
            {
                this.history[this.historyIdx]=historyObj;
                this.history=this.history.splice(0,this.historyIdx+1);
            }
            this.eventDispatcher.trigger('historyChange', this.historyIdx);
        },
        function keyLeft(index)
        {
            if (this.focusOffset == -1) {
                index = this.lineChars(this.focusLine) - 1;
                if (index == -1) {
                    this.focusLine = this.getPrevLine(this.focusLine);
                }
            }
            else {
                index--;

                var prevLine = this.getPrevLine(this.focusLine);
                var len=this.lineChars(this.focusLine);
                var totalLen=len;
                var backSearch = false;
                while (!prevLine.realLine) {
                    backSearch = true;
                    if (prevLine.$hash$ != this.focusLine.$hash$) totalLen+=this.lineChars(prevLine);
                    if (prevLine.$hash$ == this.getPrevLine(prevLine).$hash$) break;
                    prevLine = this.getPrevLine(prevLine);
                }


                if (index<totalLen-len)
                {
                    prevLine = this.getPrevLine(this.focusLine);

                    if (this.focusLine.$hash$==prevLine.$hash$)
                    {
                        index++;
                    }
                    else
                    {
                        index=this.lineChars(prevLine);
                        this.focusLine=prevLine;
                    }
                }
                else if (backSearch) {
                    totalLen-=len;
                    index-=totalLen;
                }
            }
            return index;
        },
        function deleteChar()
        {
            this.startSelection();

            var lineWidth=this.lineWidth(this.focusLine);

            if (this.endPosition.offset<lineWidth || (!this.focusLine.realLine && this.endPosition.offset==lineWidth && lineWidth!=0))
            {
                var idx=this.getOffsetIndex(this.focusLine,this.endPosition.offset,true);
                if (this.endPosition.offset==lineWidth) idx--;
                else idx++;
                var params=this.getOffsetFromIndex(this.focusLine,idx);

                this.endPosition.offset=params.offset;
                this.endPosition.label=params.label;

                this.removeSelected();
            }
            else if (this.focusLine.$hash$ != this.getNextLine(this.focusLine).$hash$ && (this.focusOffset==-1 || this.endPosition.offset==lineWidth))
            {
                var nextLine=this.getNextLine(this.focusLine);

                this.focusOffset=lineWidth;
                this.focusLabel=nextLine.kids[0];
                this.focusLine.realLine=nextLine.realLine;

                for (var i=0;i<nextLine.kids.length;i++)
                {
                    var label=nextLine.kids[i];
                    label.removeMe();
                    this.focusLine.add(label);
                    i--;
                }

                nextLine.removeMe();

                this.startSelection();
                this.removeSelected();

                this.historyRefresh(this.historyIdx);
            }
        },
        function getSelectedRange()
        {
            var start = this.startPosition, end = this.endPosition;
            var minIdx=this.kids.indexOf(start.line);
            var maxIdx=this.kids.indexOf(end.line);

            if (minIdx>maxIdx || (minIdx==maxIdx && start.offset>end.offset))
            {
                var tmp=minIdx;
                minIdx=maxIdx;
                maxIdx=tmp;
                tmp=start;
                start=end;
                end=tmp;
            }

            return {
                start : start,
                end : end,
                minIdx : minIdx,
                maxIdx : maxIdx
            }
        },
        function cloneLabel(baseLabel)
        {
            var font = baseLabel.getFont();
            var newLabel = new pkg.DecoratorLabel('');
            newLabel.setFont(font);
            newLabel.setColor(baseLabel.getColor());
            if (baseLabel.bg && baseLabel.bg.s) newLabel.setBackground(baseLabel.bg.s);
            if (font.underline) newLabel.setDecoration('underline', baseLabel.getColor());

            return newLabel;
        },
        function clipPaste(s)
        {
            if (this.isEditable !== true) return;

            var multiParts=s.split('\n');
            var isMulti=multiParts.length>1;
            var focusLineIdx=this.getSelectedRange().minIdx;
            var prevFocusLabel=this.focusLabel;

            if (this.hasSelection()) this.removeSelected();
            if (-1==focusLineIdx) focusLineIdx=this.kids.indexOf(this.focusLine);

            var lineWidth=this.lineWidth(this.focusLine);

            if (!isMulti)
            {
                if (this.endPosition.offset<lineWidth || (!this.focusLine.realLine && this.endPosition.offset==lineWidth && lineWidth!=0)) {
                    var charIndex = this.labelCharIndexAtLineOffset();
                    var value = this.focusLabel.getValue();

                    this.focusLabel.setValue(value.substring(0, charIndex)+s+value.substring(charIndex, value.length));
                    this.focusOffset=this.focusOffset+this.focusLabel.getFont().stringWidth(s);
                }
                else
                {
                    this.focusLabel=this.endPosition.line.kids[this.endPosition.line.kids.length-1];
                    this.focusLabel.setValue(this.focusLabel.getValue()+s);
                    this.focusOffset=-1;
                }

                this.clearSelection();
                this.makeHistory(this.getOffsetIndex(this.focusLine, this.focusOffset),focusLineIdx+1);

                if (!(this.focusLine.realLine && this.lineWidth(this.focusLine)<this.prefWidth-13))
                {
                    this.historyRefresh(this.historyIdx);
                }

                if (this.focusLabel!=null) this.compareLabels(prevFocusLabel, this.focusLabel);
                return;
            }

            var newLabel;

            charIndex=0;
            value="";

            if (this.endPosition.offset<lineWidth || (!this.focusLine.realLine && this.endPosition.offset==lineWidth && lineWidth!=0)) {
                charIndex = this.labelCharIndexAtLineOffset();
                value = this.focusLabel.getValue();

                this.focusLabel.setValue(value.substring(0, charIndex));
            }
            else {
                this.focusLabel=this.endPosition.line.kids[this.endPosition.line.kids.length-1];
            }

            var wasReal=this.focusLine.realLine;
            this.focusLine.realLine=true;

            var newLine=this.focusLine;
            var oldLine=this.focusLine;
            var lineIdx=0;
            var labelsToMove=[];

            for (i=oldLine.indexOf(this.focusLabel)+1;i<oldLine.kids.length;i++)
            {
                var label=oldLine.kids[i];
                label.removeMe();
                i--;
                labelsToMove.push(label);
            }

            var limitWidth=this.prefWidth-13;
            var font = this.focusLabel.getFont();
            var context=this;
            var currentLineWidth = function() { return context.lineWidth(newLine); };

            var makeLabel = function(txt)
            {
                if (currentLineWidth()>limitWidth)
                {
                    if (lineIdx>0) context.insert(focusLineIdx+lineIdx,context.focusLine.constraints,newLine);
                    newLine.realLine=false;
                    newLine = context.makeLine();
                    lineIdx++;
                }
                while (currentLineWidth()+font.stringWidth(txt)>limitWidth)
                {
                    var words = txt.split(' ');
                    var hasSpace = txt.indexOf(' ')>-1;
                    if (words.length>0)
                    {
                        var word=words[0];
                        if (hasSpace) word+=' ';
                        if (currentLineWidth()+font.stringWidth(word)>limitWidth)
                        {
                            if (!hasSpace)
                            {
                                newLabel=context.cloneLabel(context.focusLabel);
                                newLabel.setValue(word);

                                var offset=context.charIndexAtLabelOffset(newLabel,limitWidth-currentLineWidth())-1;
                                if (offset>0) {
                                    var subWord = word.substring(0, offset);
                                    newLabel.setValue(subWord);
                                    newLine.add(newLabel);
                                    context.adjustLinePadding(newLine);

                                    word = word.substring(offset, word.length);
                                }
                            }
                            if (lineIdx>0) context.insert(focusLineIdx+lineIdx,context.focusLine.constraints,newLine);
                            newLine.realLine=false;
                            newLine = context.makeLine();
                            lineIdx++;
                        }
                        newLabel=context.cloneLabel(context.focusLabel);
                        newLabel.setValue(word);

                        newLine.add(newLabel);
                        context.adjustLinePadding(newLine);
                        words.shift();
                        if (hasSpace) txt=words.join(' ');
                        else txt='';
                    }
                    if (currentLineWidth()>limitWidth)
                    {
                        if (lineIdx>0) context.insert(focusLineIdx+lineIdx,context.focusLine.constraints,newLine);
                        newLine.realLine=false;
                        newLine = context.makeLine();
                        lineIdx++;
                    }
                }
                newLabel=context.cloneLabel(context.focusLabel);
                newLabel.setValue(txt);

                newLine.add(newLabel);
                context.adjustLinePadding(newLine);
            };

            for (var i=0;i<multiParts.length;i++)
            {
                makeLabel(multiParts[i]);

                if (i!=multiParts.length-1)
                {
                    if (lineIdx>0) context.insert(focusLineIdx+lineIdx,context.focusLine.constraints,newLine);
                    newLine.realLine=true;
                    newLine=this.makeLine();
                    newLine.setLayout(new zebkit.layout.FlowLayout(this.focusLine.layout.ax, "top", "horizontal", 0));
                    lineIdx++;
                }
            }

            this.focusOffset=currentLineWidth();

            newLabel = this.cloneLabel(this.focusLabel);
            newLabel.setValue(value.substring(charIndex, value.length));

            newLine.add(newLabel);

            for (i=0;i<labelsToMove.length;i++)
            {
                newLine.add(labelsToMove[i]);
            }

            if (lineIdx>0) this.insert(focusLineIdx+lineIdx,this.focusLine.constraints,newLine);
            this.focusLine=newLine;
            this.focusLine.realLine=wasReal;


            this.focusLabel=newLabel;

            this.clearSelection();
            this.makeHistory(this.getOffsetIndex(this.focusLine, this.focusOffset),this.kids.indexOf(this.focusLine));

            this.historyRefresh(this.historyIdx);

            this.compareLabels(prevFocusLabel, this.focusLabel);
        },
        function cut() {
            var text='';
            if (this.hasSelection() && this.isEditable === true)
            {
                var prevFocusLabel=this.focusLabel;
                text=this.clipCopy();
                this.removeSelected();

                this.compareLabels(prevFocusLabel, this.focusLabel);
            }
            return text;
        },
        function clipCopy() {
            var text='';

            if (this.hasSelection())
            {
                var params=this.getSelectedRange();

                var startIdx=this.getOffsetIndex(params.start.line, params.start.offset, true);
                var endIdx=this.getOffsetIndex(params.end.line, params.end.offset, true);

                for (var i=params.minIdx;i<=params.maxIdx;i++) {

                    if (i==params.minIdx && i==params.maxIdx)
                    {
                        text=this.lineText(this.kids[i]).substring(startIdx,endIdx);
                        break;
                    }
                    else if (i==params.minIdx)
                    {
                        var subText=this.lineText(this.kids[i]);
                        text=subText.substring(startIdx,subText.length);
                        if (this.kids[i].realLine) text+='\n';
                    }
                    else if (i==params.maxIdx)
                    {
                        text+=this.lineText(this.kids[i]).substring(0, params.endIdx);
                        break;
                    }
                    else if (i>params.minIdx && i<params.maxIdx)
                    {
                        subText=this.lineText(this.kids[i]);
                        text+=subText.substring(0,subText.length);
                        if (this.kids[i].realLine) text+='\n';
                    }
                }
            }
            return text;
        },
        function focused() {
            this.$super(); // don't forget call super "focused()" method
            this.repaint();// trigger the component repaint

            var $this=this;

            if (this.blinkTask == null && this.isEditable === true) {
                this.blinkMeCounter = 0;
                this.blinkMe = true;
                this.blinkTask = zebkit.util.tasksSet.run(function() {
                        $this.blinkMeCounter = ($this.blinkMeCounter + 1) % 3;
                        if ($this.blinkMeCounter === 0) {
                            $this.blinkMe = !$this.blinkMe;
                            $this.repaint();
                            //$this.repaintCursor();
                        }
                    },
                    Math.floor($this.blinkingPeriod / 3),
                    Math.floor($this.blinkingPeriod / 3)
                );
            }
        },
        function focusLost(e){
            if (this.isEditable === true) {
                this.repaint();

                if (this.blinkingPeriod > 0) {
                    if (this.blinkTask != null) {
                        this.blinkTask.shutdown();
                        this.blinkTask = null;
                    }
                    this.blinkMe = true;
                }
            }
        },
        function run() {
            this.blinkMeCounter = (this.blinkMeCounter + 1) % 3;

            if (this.blinkMeCounter === 0) {
                this.blinkMe = !this.blinkMe;
                this.repaint();
            }
        },
        function pointerDragStarted(e){
            if (e.mask == MouseEvent.LEFT_BUTTON && this.focusLabel!=null) {
                this.startSelection();
            }
        },
        function pointerDragEnded(e){
            if (e.mask == MouseEvent.LEFT_BUTTON && this.hasSelection() === false) {
                this.clearSelection();
            }
            else if (e.mask == MouseEvent.LEFT_BUTTON)
            {
                this.selectionRendered=false;
                this.compareLabels(this.startPosition.label,this.endPosition.label);
            }
        },
        function pointerDragged(e){
            if (e.mask == MouseEvent.LEFT_BUTTON){
                var compAt = this.getCanvas().root.getComponentAt(e.absX,e.absY);//this.getComponentAt(e.x,e.y);

                if (!((zebkit.instanceOf(compAt, pkg.Label) && compAt.parent.parent.$hash$==this.$hash$) ||
                    (compAt!=null && compAt.kids.length>0 && zebkit.instanceOf(compAt.kids[0], pkg.Label) && compAt.parent.$hash$==this.$hash$))) return;

                this.focusLabel = null;
                this.focusOffset = -1;
                if (zebkit.instanceOf(compAt, pkg.Label) && compAt.parent.parent.$hash$==this.$hash$)
                {
                    this.endPosition.label=compAt;
                    this.endPosition.line=compAt.parent;
                    this.endPosition.offset=this.getOffset(this.endPosition.line,e.x-this.endPosition.line.kids[0].x);

                    this.focusLabel=compAt;
                    this.focusLine=compAt.parent;
                    this.focusOffset=this.endPosition.offset;
                }
                else
                {
                    this.endPosition.label=compAt.kids[compAt.kids.length-1];
                    this.endPosition.line=compAt;
                    this.endPosition.offset=this.lineWidth(compAt);

                    this.focusLine=compAt;
                }

                this.repaint();
            }
        },
        function labelCharIndexAtLineOffset()
        {
            var xPos = 0;
            for (var i = 0; i < this.focusLine.kids.length; i++) {
                if (this.focusLine.kids[i].$hash$ != this.focusLabel.$hash$) {
                    xPos += this.focusLine.kids[i].getFont().stringWidth(this.focusLine.kids[i].getValue());
                }
                else break;
            }

            return this.charIndexAtLabelOffset(this.focusLabel, this.focusOffset - xPos);
        },
        function charIndexAtLabelOffset(label,x)
        {
            var labelText=label.getValue();
            var i, minIdx = 0, maxIdx = labelText.length;

            while (minIdx <= maxIdx) {
                i = (minIdx + maxIdx) / 2 | 0;
                var currOffset=label.getFont().stringWidth(labelText.substring(0,i));

                if (currOffset < x) {
                    minIdx = i + 1;
                }
                else if (currOffset > x) {
                    maxIdx = i - 1;
                }
                else {
                    return i;
                }
            }
            for (i=Math.max(0,maxIdx-1);i<labelText.length;i++)
            {
                currOffset=label.getFont().stringWidth(labelText.substring(0,i));
                if (currOffset>=x-1)
                {
                    return i;
                }
            }

            return -1;
        },
        function getNextRealLine(line)
        {
            if (line.realLine) return line;

            for (var i=this.kids.indexOf(line);i<this.kids.length;i++)
            {
                if (this.kids[i].realLine) return this.kids[i];
            }
            return line;
        },
        function getNextLine(line)
        {
            var idx=this.kids.indexOf(line);
            if (idx!=-1 && idx+1<this.kids.length) return this.kids[idx+1];
            else return line;
        },
        function getPrevLine(line)
        {
            var idx=this.kids.indexOf(line);
            if (idx-1>-1) return this.kids[idx-1];
            else return line;
        },
        function getOffset(line,x)
        {
            if (x==0) return 0;

            var length=0;
            for (var i=0;i<line.kids.length;i++)
            {
                var label = line.kids[i];
                var text = label.getValue();
                var labelWidth = label.getFont().stringWidth(text);
                if (length+labelWidth>x)
                {
                    var subText='';
                    for (var ii=0;ii<text.length;ii++)
                    {
                        subText+=text[ii];
                        var subLength=length+label.getFont().stringWidth(subText);
                        if (subLength>=x)
                        {
                            var prevLength=subLength-label.getFont().stringWidth(text[ii]);
                            if (x-prevLength<subLength-x) return prevLength;
                            else return subLength;
                        }
                    }
                }
                else length+=labelWidth;
            }
            return -1;
        },
        function getOffsetFromIndex(line,index)
        {
            if (index==0)
            {
                if (line.kids.length>0)
                {
                    return {label:line.kids[0], offset:0};
                }
                else return {label:null, offset:0};
            }

            var length=0;
            var strPos=0;
            for (var i=0;i<line.kids.length;i++)
            {
                var label = line.kids[i];
                var text = label.getValue();
                var labelWidth = label.getFont().stringWidth(text);
                if (strPos+text.length>index)
                {
                    var subText='';
                    for (var ii=0;ii<text.length;ii++)
                    {
                        subText+=text[ii];
                        strPos++;
                        var subLength=length+label.getFont().stringWidth(subText);
                        if (strPos==index)
                        {
                            return {label:label, offset:subLength};
                        }
                    }
                }
                else
                {
                    length+=labelWidth;
                    strPos+=text.length;
                    if (strPos==index)
                    {
                        return {label:label, offset:length};
                    }
                }
            }
            return {label:null, offset:-1};
        },
        function getOffsetIndex(line,x,noBackWalk)
        {
            if (x<0) x=this.lineWidth(line);
            //else if (x==0) return 0;

            var length=0;
            var index=0;
            for (var i=0;i<line.kids.length;i++)
            {
                var label = line.kids[i];
                var text = label.getValue();
                var labelWidth = label.getFont().stringWidth(text);
                if (length+labelWidth>=x)
                {
                    var subText='';
                    for (var ii=0;ii<text.length;ii++)
                    {
                        subText+=text[ii];
                        var subLength=length+label.getFont().stringWidth(subText);
                        if (subLength>=x)
                        {
                            var prevLength=subLength-label.getFont().stringWidth(text[ii]);
                            if (x-prevLength>=subLength-x) index++;
                            if (!noBackWalk) {
                                var prevLine = this.getPrevLine(line);
                                while (!prevLine.realLine && line.$hash$ != prevLine.$hash$) {
                                    index += this.lineChars(prevLine);
                                    line = prevLine;
                                    prevLine = this.getPrevLine(line);
                                }
                            }
                            return index;
                        }
                        index++;
                    }
                }
                else
                {
                    length+=labelWidth;
                    index+=text.length;
                }
            }
            return index;
        },
        function lineWidth(line)
        {
            var length=0;
            line.kids.forEach(function(label)
            {
                length+=label.getFont().stringWidth(label.getValue());
            });
            return length;
        },
        function lineChars(line)
        {
            var length=0;
            line.kids.forEach(function(label)
            {
                length+=label.getValue().length;
            });
            return length;
        },
        function lineText(line)
        {
            var text='';
            line.kids.forEach(function(label)
            {
                text+=label.getValue();
            });
            return text;
        },
        function makeJsonText()
        {
            var json_text=[];
            var text_obj ={
                text: ''
            };

            var thisSize, thisFont, thisColor, thisBackground;
            var thisBold, thisItalic, thisUnderline, thisAlign;
            var start = true;

            for (var i=0;i<this.kids.length;i++) {
                var line=this.kids[i];
                for (var ii=0;ii<line.kids.length;ii++) {
                    var label=line.kids[ii];
                    var lastLabel=ii==line.kids.length-1;

                    var labelColor=label.getColor();
                    var labelBackground=this.defaultBackground;

                    if (label.bg && label.bg.s) labelBackground=label.bg.s;

                    var font=label.getFont();
                    var fontParts=font.s.split(' ');

                    var labelBold=false,labelItalic=false,labelUnderline=false;
                    var labelFont=font.family, labelSize=font.realSize;//this.defaultSize;
                    var labelAlign=line.layout.ax;

                    if (fontParts.indexOf('bold')!=-1) labelBold=true;
                    if (fontParts.indexOf('italic')!=-1) labelItalic=true;
                    if (font.underline) labelUnderline=true;

                    if (start || thisSize!=labelSize || thisFont!=labelFont ||
                        thisColor!=labelColor || thisBackground!=labelBackground || thisAlign!= labelAlign ||
                        thisBold!=labelBold || thisItalic!=labelItalic || thisUnderline!=labelUnderline)
                    {
                        if (!start && text_obj.text!='') json_text.push(text_obj);

                        text_obj ={
                            text: ''
                        };
                        if (labelSize!=this.defaultSize) text_obj.size=labelSize;
                        if (labelFont!=this.defaultFont) text_obj.font=labelFont;
                        if (labelColor!=this.defaultColor) text_obj.color=labelColor;
                        if (labelBackground!=this.defaultBackground) text_obj.background=labelBackground;
                        if (labelBold!=this.defaultBold) text_obj.bold=labelBold;
                        if (labelItalic!=this.defaultItalic) text_obj.italic=labelItalic;
                        if (labelUnderline!=this.defaultUnderline) text_obj.underline=labelUnderline;
                        if (labelAlign!=this.defaultAlign) {
                            if (labelAlign==="left") text_obj.align='left';
                            else if (labelAlign==="right") text_obj.align='right';
                            else if (labelAlign==="center") text_obj.align='center';
                        }
                    }

                    text_obj.text+=label.getValue();

                    if (lastLabel && line.realLine) text_obj.text+='\n';

                    start=false;
                    thisSize=labelSize;
                    thisFont=labelFont;
                    thisColor=labelColor;
                    thisBackground=labelBackground;
                    thisBold=labelBold;
                    thisItalic=labelItalic;
                    thisUnderline=labelUnderline;
                    thisAlign=labelAlign;
                }
            }
            json_text.push(text_obj);

            return json_text;
        },
        function makeLine()
        {
            var line = new pkg.Panel(new zebkit.layout.FlowLayout("left","top","horizontal",0));
            line.$hash$ = zebkit.io.UID();
            line.setPadding(0, 0, 0, 0);
            line.cursorType = pkg.Cursor.TEXT;
            line.realLine=true;

            return line;
        },
        function adjustLinePadding(line)
        {
            var maxHeight=0;
            line.kids.forEach(function(label)
            {
                maxHeight=Math.max(maxHeight,label.getPreferredSize().height);
            });
            line.kids.forEach(function(label)
            {
                var height=label.getPreferredSize().height;
                if (height<maxHeight) label.setPadding((maxHeight-height)+label.getTop(),0,0,0);
            });
        },
        function makeContent(json_text)
        {
            var context=this;
            var Line = this.makeLine;
            var currentLine=Line();

            var currentLineWidth = function()
            {
                return context.lineWidth(currentLine);
            };

            json_text.forEach(function(item){
                var currentStyle='';
                if (item.bold) currentStyle+='bold';
                if (item.italic) currentStyle+=' italic';
                currentStyle=currentStyle.trim();

                // fixups for dodgy old Infographic Text
                if (typeof item.font == 'number') delete item['font'];
                if (typeof item.text == 'object')
                {
                    if (typeof item.text.text != 'undefined') item.text=item.text.text;
                }
                item.text=item.text.toString();

                var font = new zebkit.Font(item.font?item.font:context.defaultFont,currentStyle,(item.size?item.size:context.defaultSize));
                font.realSize=item.size?item.size:context.defaultSize;
                font.underline=item.underline?true:false;

                var isMulti=(item.text.indexOf('\n')!=-1);

                var limitWidth=context.prefWidth-13; // space for scrollbar

                var makeLabel = function(txt)
                {
                    if (currentLineWidth()>limitWidth)
                    {
                        context.add(currentLine);
                        currentLine.realLine=false;
                        currentLine = Line();
                    }
                    while (currentLineWidth()+font.stringWidth(txt)>limitWidth)
                    {
                        var words = txt.split(' ');
                        var hasSpace = txt.indexOf(' ')>-1;
                        if (words.length>0)
                        {
                            var word=words[0];
                            if (hasSpace) word+=' ';
                            if (currentLineWidth()+font.stringWidth(word)>limitWidth)
                            {
                                // use this if don't want to wrap text
                                /*
                                while (font.stringWidth(word)>limitWidth)
                                {
                                    var label = new pkg.DecoratorLabel(word);
                                    label.setFont(font);
                                    label.setColor(item.color?item.color:context.defaultColor);
                                    if (item.background) label.setBackground(item.background);
                                    if (font.underline) label.setDecoration('underline', label.getColor());

                                    var offset = context.charIndexAtLabelOffset(label, limitWidth - currentLineWidth()) - 1;
                                    if (offset > -1) {
                                        var subWord = word.substring(0, offset);
                                        label.setValue(subWord);
                                        currentLine.add(label);
                                        if (item.align)
                                        {
                                            currentLine.setLayout(new zebkit.layout.FlowLayout(item.align=='right'?"right":item.align=='center'?"center":"left", "top", "horizontal", 0));
                                        }
                                        context.adjustLinePadding(currentLine);

                                        word = word.substring(offset, word.length);
                                    }
                                    else break;

                                    context.add(currentLine);
                                    currentLine.realLine = false;
                                    currentLine = Line();
                                }*/

                                context.add(currentLine);
                                currentLine.realLine = false;
                                currentLine = Line();

                                var label=new pkg.DecoratorLabel(word);
                                label.setFont(font);
                                label.setColor(item.color?item.color:context.defaultColor);
                                if (item.background) label.setBackground(item.background);
                                if (font.underline) label.setDecoration('underline', label.getColor());

                                currentLine.add(label);
                                if (item.align)
                                {
                                    currentLine.setLayout(new zebkit.layout.FlowLayout(item.align=='right'?'right':item.align=='center'?"center":"left", "top", "horizontal", 0));
                                }
                                context.adjustLinePadding(currentLine);
                                words.shift();
                                if (hasSpace) txt=words.join(' ');
                                else txt='';
                            }
                            else
                            {
                                var txtPart=word, i=1;

                                while (i<words.length-1 && currentLineWidth()+font.stringWidth(txtPart+words[i]+' ')<=limitWidth)
                                {
                                    txtPart+=words[i]+' ';
                                    i++;
                                }

                                var label=new pkg.DecoratorLabel(txtPart);
                                label.setFont(font);
                                label.setColor(item.color?item.color:context.defaultColor);
                                if (item.background) label.setBackground(item.background);
                                if (font.underline) label.setDecoration('underline', label.getColor());

                                currentLine.add(label);
                                if (item.align)
                                {
                                    currentLine.setLayout(new zebkit.layout.FlowLayout(item.align=='right'?'right':item.align=='center'?"center":"left", "top", "horizontal", 0));
                                }
                                context.adjustLinePadding(currentLine);

                                if (hasSpace) txt=txt.substring(txtPart.length, txt.length);
                                else txt='';
                            }
                        }
                        if (currentLineWidth()+font.stringWidth(' ')>limitWidth) //space here to capture the case where word overflow offset later is smaller than a space and indexes to zero
                        {
                            context.add(currentLine);
                            currentLine.realLine=false;
                            currentLine = Line();
                        }
                    }
                    if (txt!='' || currentLine.kids.length==0)
                    {
                        label=new pkg.DecoratorLabel(txt);
                        label.setFont(font);
                        label.setColor(item.color?item.color:context.defaultColor);
                        if (item.background) label.setBackground(item.background);
                        if (font.underline) label.setDecoration('underline', label.getColor());

                        currentLine.add(label);
                        if (item.align && txt!='')
                        {
                            currentLine.setLayout(new zebkit.layout.FlowLayout(item.align=='right'?"right":item.align=='center'?"center":"left", "top", "horizontal", 0));
                        }
                        context.adjustLinePadding(currentLine);
                    }
                };

                if (isMulti) {
                    var txt = item.text.split('\n');

                    txt.forEach(function (sub,iter) {
                        makeLabel(sub);
                        if (iter<txt.length-1) {
                            context.add(currentLine);
                            currentLine = Line();
                        }
                    });
                }
                else
                {
                    makeLabel(item.text);
                }
            });

            if (currentLine.kids.length>1 || this.kids.length==0) this.add(currentLine);
            else if (currentLine.kids[0].getValue().length>0) this.add(currentLine);

            this.focusLine=this.kids[this.kids.length-1];
            this.resetHeight();
        },
        function resetHeight()
        {
            var prefHeight=0;

            this.kids.forEach(function(line)
            {
                prefHeight+=line.getPreferredSize().height;
            });

            this.setPreferredSize(this.prefWidth-13, Math.max(this.scrollHeight,prefHeight));
        }
    ]);

    pkg.TextEditorControls = Class(pkg.Panel, [
        function(edit)
        {
            this.$super();
            var $this=this;
            this.edit=edit;

            var btnRow1 = new pkg.Panel();
            btnRow1.setLayout(new zebkit.layout.FlowLayout("left", "center", "horizontal", 2));
            btnRow1.setBackground("rgba(240,240,240,1)");
            var btnRow2 = new pkg.Panel();
            btnRow2.setLayout(new zebkit.layout.FlowLayout("left", "center", "horizontal", 2));
            btnRow2.setBackground("rgba(240,240,240,1)");

            var fonts = [
                "Andale Mono",
                "Arial",
                "Arial Black",
                "Book Antiqua",
                "Comic Sans MS",
                "Courier New",
                "Georgia",
                "Helvetica",
                "Impact",
                "Monospace",
                "Sans Serif",
                "Symbol",
                "Tahoma",
                "Terminal",
                "Times New Roman",
                "Trebuchet MS",
                "Verdana",
                "Webdings",
                "Wingdings"
            ];

            var fontSize = [
                "8px",
                "10px",
                "11px",
                "12px",
                "14px",
                "16px",
                "18px",
                "20px",
                "24px",
                "30px",
                "36px",
                "48px",
                "60px",
                "72px",
                "144px"
            ];

            this.fontList = this.createList(fonts, 150, 36, edit.scrollPan.getPreferredSize().width>592?btnRow2:btnRow1, "Font");
            this.fontList.list.select(edit.defaultFont);
            this.fontList.on("selected", function (src, value) {
                if (src.getValue() != null)
                {
                    edit.selectedFont=src.getValue();
                    $this.checkSelection();
                    edit.requestFocus();
                }

            });

            this.fontSizeList = this.createList(fontSize, 74, 36, edit.scrollPan.getPreferredSize().width>592?btnRow2:btnRow1, "Font Size");
            this.fontSizeList.list.select(fontSize.indexOf($this.defaultSize+"px"));
            this.fontSizeList.on("selected", function (src, value) {
                if (src.getValue() != null) {
                    edit.selectedSize = parseInt(src.getValue());
                    $this.checkSelection();
                    edit.requestFocus();
                }
            });

            this.undoBtn = this.createButton2(zebkit.ui.pictures.edit_undo, 36, 36, edit.scrollPan.getPreferredSize().width>592?btnRow2:btnRow1, "Undo");
            this.undoBtn.on(function (src) {
                edit.performUndo();
                edit.requestFocus();
            });

            this.redoBtn = this.createButton2(zebkit.ui.pictures.edit_redo, 36, 36, edit.scrollPan.getPreferredSize().width>592?btnRow2:btnRow1, "Redo");
            this.redoBtn.on(function (src) {
                edit.performRedo();
                edit.requestFocus();
            });

            this.boldBtn = this.createButton2(zebkit.ui.pictures.edit_bold, 36, 36, btnRow2, "Bold");
            this.boldBtn.on(function (src) {
                edit.selectedBold=!edit.selectedBold;
                $this.changeBorder($this.boldBtn,edit.selectedBold);
                $this.checkSelection();
                edit.requestFocus();
            });

            this.italicBtn = this.createButton2(zebkit.ui.pictures.edit_italics, 36, 36, btnRow2, "Italic");
            this.italicBtn.on(function (src) {
                edit.selectedItalic=!edit.selectedItalic;
                $this.changeBorder($this.italicBtn,edit.selectedItalic);
                $this.checkSelection();
                edit.requestFocus();
            });

            this.underlineBtn = this.createButton2(zebkit.ui.pictures.edit_underline, 36, 36, btnRow2, "Underline");
            this.underlineBtn.on(function (src) {
                edit.selectedUnderline=!edit.selectedUnderline;
                $this.changeBorder($this.underlineBtn,edit.selectedUnderline);
                $this.checkSelection();
                edit.requestFocus();
            });

            this.textColourBtn = this.createButton2(false, 36, 36, btnRow2, "Text Color", true);
            this.textColourBtn.setBackground("#000000");
            this.textColourBtn.on(function (src) {
                $this.colorPicker(edit, "text", src, edit.selectedColor, function(){
                    $this.checkSelection();
                });
            });

            this.textBackColourBtn = this.createButton2(false, 36, 36, btnRow2, "Text Background Color", true);
            this.textBackColourBtn.setBackground("rgba(255,255,255,0)");
            this.textBackColourBtn.setBorder(new zebkit.draw.ViewSet({
                'focuson': new zebkit.draw.Border("rgba(126, 239, 104, 0.6)", 2, 0),
                'focusoff': new zebkit.draw.Border("#C5C5C5", 2, 2)
            }));
            this.textBackColourBtn.on(function (src) {
                $this.colorPicker(edit, "background", src, edit.selectedBackground, function(){
                    $this.checkSelection();
                });
            });

            this.leftABtn = this.createButton2(new zebkit.draw.Picture(zebkit.ui.pictures.halflings, 264, 48, 14, 14), 36, 36, btnRow2, "Align Left");
            this.leftABtn.on(function (src) {
                edit.selectedAlign="left";

                $this.setAlignment();
                $this.changeBorder($this.leftABtn, true);
                $this.changeBorder($this.centerABtn, false);
                $this.changeBorder($this.rightABtn, false);

                edit.requestFocus();
            });
            this.changeBorder(this.leftABtn, true);

            this.centerABtn = this.createButton2(new zebkit.draw.Picture(zebkit.ui.pictures.halflings, 288, 48, 14, 14), 36, 36, btnRow2, "Align Center");
            this.centerABtn.on(function (src) {
                edit.selectedAlign="center";

                $this.setAlignment();
                $this.changeBorder($this.leftABtn, false);
                $this.changeBorder($this.centerABtn, true);
                $this.changeBorder($this.rightABtn, false);

                edit.requestFocus();
            });

            this.rightABtn = this.createButton2(new zebkit.draw.Picture(zebkit.ui.pictures.halflings, 312, 48, 14, 14), 36, 36, btnRow2, "Align Right");
            this.rightABtn.on(function (src) {
                edit.selectedAlign="right";

                $this.setAlignment();
                $this.changeBorder($this.leftABtn, false);
                $this.changeBorder($this.centerABtn, false);
                $this.changeBorder($this.rightABtn, true);

                edit.requestFocus();
            });

            var labelChange = function(e)
            {
                var fontObj=e.detail;

                $this.fontSizeList.setValue(fontObj.size+'px');
                $this.fontList.setValue(fontObj.name);

                if (fontObj.bold!=edit.selectedBold){
                    edit.selectedBold=!edit.selectedBold;
                    $this.changeBorder($this.boldBtn,edit.selectedBold);
                }
                if (fontObj.italic!=edit.selectedItalic){
                    edit.selectedItalic=!edit.selectedItalic;
                    $this.changeBorder($this.italicBtn,edit.selectedItalic);
                }
                if (fontObj.underline!=edit.selectedUnderline){
                    edit.selectedUnderline=!edit.selectedUnderline;
                    $this.changeBorder($this.underlineBtn,edit.selectedUnderline);
                }
                if (fontObj.color!=edit.selectedColor){
                    edit.selectedColor=fontObj.color;
                    $this.textColourBtn.setBackground(fontObj.color);
                }
                if (fontObj.background!=edit.selectedBackground){
                    edit.selectedBackground=fontObj.background;
                    $this.textBackColourBtn.setBackground(fontObj.background);
                }
                if (fontObj.align!=edit.selectedAlign){
                    edit.selectedAlign=fontObj.align;
                    $this.changeBorder($this.leftABtn, edit.selectedAlign==="left");
                    $this.changeBorder($this.centerABtn, edit.selectedAlign==="center");
                    $this.changeBorder($this.rightABtn, edit.selectedAlign==="right");
                }
            };

            var historyChange =function(e)
            {
                if (edit.historyIdx==0) {
                    $this.undoBtn.setBackground("rgba(133,133,133,0)")
                } else {
                    $this.undoBtn.setBackground("rgba(133,133,133,1)")
                }
                if (edit.historyIdx>=edit.history.length-1) {
                    $this.redoBtn.setBackground("rgba(133,133,133,0)")
                } else {
                    $this.redoBtn.setBackground("rgba(133,133,133,1)")
                }
            };
            historyChange();

            edit.selectedSize=edit.defaultSize;
            edit.selectedFont=edit.defaultFont;
            edit.selectedColor=edit.defaultColor;
            edit.selectedBackground=edit.defaultBackground;
            edit.selectedBold=edit.defaultBold;
            edit.selectedItalic=edit.defaultItalic;
            edit.selectedUnderline=edit.defaultUnderline;
            edit.selectedAlign=edit.defaultAlign;

            this.fontSizeList.setValue(edit.selectedSize+'px');
            this.fontList.setValue(edit.selectedFont);

            edit.eventDispatcher.on('labelChange', labelChange);
            edit.eventDispatcher.on('historyChange', historyChange);

            this.shutdown = function()
            {
                edit.eventDispatcher.off('labelChange', labelChange);
                edit.eventDispatcher.off('historyChange', historyChange);
            };

            this.setBackground("rgba(240,240,240,1)");
            this.setLayout(new zebkit.layout.GridLayout(4, 1, "horizontal"));
            this.add(btnRow1);
            this.add(btnRow2);

            if (edit.focusLabel) {
                edit.eventDispatcher.trigger('labelChange', edit.labelValues(edit.focusLabel));
            }

        },
        function changeBorder(button, value) {
            if (value != undefined) {
                if (value) {
                    button.setBorder(new zebkit.draw.ViewSet({
                        'focuson': new zebkit.draw.Border("rgba(126, 239, 104, 0.6)", 2, 0),
                        'focusoff': new zebkit.draw.Border("green", 3, 2)
                    }));
                    return false;
                } else {
                    button.setBorder(new zebkit.draw.ViewSet({
                        'focuson': new zebkit.draw.Border("rgba(126, 239, 104, 0.6)", 2, 0),
                        'focusoff': new zebkit.draw.Border("#C5C5C5", 1, 2)
                    }));
                    return false;
                }
            }
            else return (button.border.views.focusoff.color == "#C5C5C5");
        },
        function createButton2(img, width, height, row, tip, notext)
        {
            var button;
            if (img) {
                button = new pkg.Button(new pkg.ImagePan(img));
            } else if (notext){
                button = new pkg.Button();
            } else {
                button = new pkg.Button(tip);
            }
            button.setPreferredSize(width, height);
            row.add(button);

            var createLabel = function (txt, color, font) {
                color = color || zebkit.ui.palette.gray1;
                var l = new pkg.Label(txt.indexOf("\n") >= 0 ? new zebkit.data.Text(txt) : txt);
                l.setColor(color);
                if (font) l.setFont(font);
                else l.setFont(zebkit.ui.boldFont);
                l.setBorder(new zebkit.draw.Border(zebkit.draw.rgb.gray));
                l.setPadding(1);
                return l;
            };
            var t1 = createLabel(tip, "#6FAA42");
            t1.setPadding(6);
            t1.setBackground("#fff");
            button.tooltip = t1;

            return button;
        },
        function createList(list, width, height, row, tip)
        {
            var comboList = new pkg.Combo(list);
            comboList.setPreferredSize(width, height);
            comboList.kids[1].extend([
                function setSize(w,h)
                {
                    this.$super(w, 24);
                },
                function setLocation(x,y)
                {
                    this.$super(x, ((height-24)/2)+1);
                }
            ]);
            row.add(comboList);

            var createLabel = function (txt, color, font) {
                color = color || zebkit.ui.palette.gray1;
                var l = new pkg.Label(txt.indexOf("\n") >= 0 ? new zebkit.data.Text(txt) : txt);
                l.setColor(color);
                if (font) l.setFont(font);
                else l.setFont(zebkit.ui.boldFont);
                l.setBorder(new zebkit.draw.Border(zebkit.draw.rgb.gray));
                l.setPadding(1);
                return l;
            };
            var t1 = createLabel(tip, "#6FAA42");
            t1.setPadding(6);
            t1.setBackground("#fff");
            comboList.tooltip = t1;

            return comboList;
        },
        function checkSelection()
        {
            var $this=this.edit;

            if ($this.hasSelection() && $this.selectionRendered)
            {
                var params=$this.getSelectedRange();

                if (params.minIdx==-1 || params.maxIdx==-1) return;

                var newOffset=0;

                var startIdx=$this.getOffsetIndex(params.start.line, params.start.offset, true);
                var endIdx=$this.getOffsetIndex(params.end.line, params.end.offset, true);

                for (var i=params.minIdx;i<=params.maxIdx;i++) {

                    if (i==params.minIdx && i==params.maxIdx)
                    {
                        var textLen=0;

                        for (var ii=0;ii<$this.kids[i].kids.length;ii++) {
                            var label = $this.kids[i].kids[ii];
                            var labelValue=label.getValue();
                            var labelLen=labelValue.length;

                            if (textLen<=startIdx && textLen+labelLen>startIdx)
                            {
                                var fontObj = $this.labelValues(label);
                                if (JSON.stringify(fontObj) !== JSON.stringify($this.currentValues()))
                                {
                                    if (textLen+labelLen<endIdx && textLen==startIdx)
                                    {
                                        label.setFont($this.fontFromCurrent());
                                        label.setColor($this.selectedColor);
                                        label.setBackground($this.selectedBackground);
                                        if ($this.selectedUnderline) label.setDecoration('underline', label.getColor());
                                        newOffset+=label.getFont().stringWidth(label.getValue());
                                    }
                                    else
                                    {
                                        label.setValue(labelValue.substr(0,startIdx-textLen));
                                        newOffset+=label.getFont().stringWidth(label.getValue());

                                        label=new pkg.DecoratorLabel(labelValue.substr(startIdx-textLen,endIdx-startIdx));
                                        label.setFont($this.fontFromCurrent());
                                        label.setColor($this.selectedColor);
                                        label.setBackground($this.selectedBackground);
                                        if ($this.selectedUnderline) label.setDecoration('underline', label.getColor());
                                        newOffset+=label.getFont().stringWidth(label.getValue());

                                        $this.kids[i].insert(ii+1,$this.kids[i].kids[ii].constraints,label);
                                        ii++;

                                        if (endIdx-textLen<labelLen)
                                        {
                                            label=new pkg.DecoratorLabel(labelValue.substr(endIdx-textLen,labelLen));
                                            label.setFont($this.fontFromValue(fontObj));
                                            label.setColor(fontObj.color);
                                            label.setBackground(fontObj.background);
                                            if (fontObj.underline) label.setDecoration('underline', label.getColor());

                                            $this.kids[i].insert(ii+1,$this.kids[i].kids[ii].constraints,label);
                                            ii++;
                                        }
                                    }
                                }
                            }
                            else if (textLen>startIdx && textLen<endIdx)
                            {
                                fontObj = $this.labelValues(label);
                                if (JSON.stringify(fontObj) !== JSON.stringify($this.currentValues()))
                                {
                                    if (textLen + labelLen < endIdx)
                                    {
                                        label.setFont($this.fontFromCurrent());
                                        label.setColor($this.selectedColor);
                                        label.setBackground($this.selectedBackground);
                                        if ($this.selectedUnderline) label.setDecoration('underline', label.getColor());
                                        newOffset+=label.getFont().stringWidth(label.getValue());
                                    }
                                    else
                                    {
                                        label.setFont($this.fontFromCurrent());
                                        label.setColor($this.selectedColor);
                                        label.setBackground($this.selectedBackground);
                                        if ($this.selectedUnderline) label.setDecoration('underline', label.getColor());
                                        label.setValue(labelValue.substr(0, endIdx - textLen));
                                        newOffset+=label.getFont().stringWidth(label.getValue());

                                        label=new pkg.DecoratorLabel(labelValue.substr(endIdx-textLen,labelLen));
                                        label.setFont($this.fontFromValue(fontObj));
                                        label.setColor(fontObj.color);
                                        label.setBackground(fontObj.background);
                                        if (fontObj.underline) label.setDecoration('underline', label.getColor());

                                        $this.kids[i].insert(ii+1,$this.kids[i].kids[ii].constraints,label);
                                        ii++;
                                    }
                                }
                            }
                            else if (textLen<=startIdx) newOffset+=label.getFont().stringWidth(label.getValue());

                            textLen+=labelLen;
                        }


                        break;
                    }
                    else if (i==params.minIdx)
                    {
                        textLen=0;

                        for (ii=0;ii<$this.kids[i].kids.length;ii++)
                        {
                            label = $this.kids[i].kids[ii];
                            labelValue = label.getValue();
                            labelLen = labelValue.length;

                            if (textLen <= startIdx && textLen + labelLen > startIdx)
                            {
                                fontObj = $this.labelValues(label);
                                if (JSON.stringify(fontObj) !== JSON.stringify($this.currentValues()))
                                {
                                    if (startIdx==textLen)
                                    {
                                        label.setFont($this.fontFromCurrent());
                                        label.setColor($this.selectedColor);
                                        label.setBackground($this.selectedBackground);
                                        if ($this.selectedUnderline) label.setDecoration('underline', label.getColor());
                                    }
                                    else
                                    {
                                        label.setValue(labelValue.substr(0, startIdx - textLen));

                                        label = new pkg.DecoratorLabel(labelValue.substr(startIdx - textLen, labelLen));

                                        label.setFont($this.fontFromCurrent());
                                        label.setColor($this.selectedColor);
                                        label.setBackground($this.selectedBackground);
                                        if ($this.selectedUnderline) label.setDecoration('underline', label.getColor());

                                        $this.kids[i].insert(ii + 1, $this.kids[i].kids[ii].constraints, label);
                                        ii++;
                                    }
                                }
                            }
                            else if (textLen + labelLen > startIdx)
                            {
                                fontObj = $this.labelValues(label);
                                if (JSON.stringify(fontObj) !== JSON.stringify($this.currentValues))
                                {
                                    label.setFont($this.fontFromCurrent());
                                    label.setColor($this.selectedColor);
                                    label.setBackground($this.selectedBackground);
                                    if ($this.selectedUnderline) label.setDecoration('underline', label.getColor());
                                }
                            }

                            textLen+=labelLen;
                        }
                    }
                    else if (i==params.maxIdx)
                    {
                        textLen=0;

                        for (ii=0;ii<$this.kids[i].kids.length;ii++)
                        {
                            label = $this.kids[i].kids[ii];
                            labelValue = label.getValue();
                            labelLen = labelValue.length;

                            if (textLen<endIdx)
                            {
                                fontObj = $this.labelValues(label);
                                if (JSON.stringify(fontObj) !== JSON.stringify($this.currentValues()))
                                {
                                    if (textLen + labelLen < endIdx)
                                    {
                                        label.setFont($this.fontFromCurrent());
                                        label.setColor($this.selectedColor);
                                        label.setBackground($this.selectedBackground);
                                        if ($this.selectedUnderline) label.setDecoration('underline', label.getColor());

                                        newOffset+=label.getFont().stringWidth(label.getValue());
                                    }
                                    else
                                    {
                                        label.setFont($this.fontFromCurrent());
                                        label.setColor($this.selectedColor);
                                        label.setBackground($this.selectedBackground);
                                        if ($this.selectedUnderline) label.setDecoration('underline', label.getColor());

                                        label.setValue(labelValue.substr(0, endIdx - textLen));
                                        newOffset+=label.getFont().stringWidth(label.getValue());

                                        label=new pkg.DecoratorLabel(labelValue.substr(endIdx-textLen,labelLen));
                                        label.setFont($this.fontFromValue(fontObj));
                                        label.setColor(fontObj.color);
                                        label.setBackground(fontObj.background);
                                        if (fontObj.underline) label.setDecoration('underline', label.getColor());

                                        $this.kids[i].insert(ii+1,$this.kids[i].kids[ii].constraints,label);
                                        ii++;
                                    }
                                }
                            }

                            textLen+=labelLen;
                        }

                        break;
                    }
                    else if (i>params.minIdx && i<params.maxIdx)
                    {
                        for (ii=0;ii<$this.kids[i].kids.length;ii++)
                        {
                            label = $this.kids[i].kids[ii];
                            label.setFont($this.fontFromCurrent());
                            label.setColor($this.selectedColor);
                            label.setBackground($this.selectedBackground);
                            if ($this.selectedUnderline) label.setDecoration('underline', label.getColor());
                        }
                    }
                }

                var backwards = (params.start.line.$hash$==$this.endPosition.line.$hash$ &&
                params.start.label.$hash$==$this.endPosition.label.$hash$ &&
                params.start.offset==$this.endPosition.offset);

                $this.focusOffset=newOffset;
                $this.clearSelection();
                if ($this.focusLine!=null) $this.makeHistory($this.getOffsetIndex($this.focusLine, $this.focusOffset),$this.kids.indexOf($this.focusLine));
                $this.historyRefresh($this.historyIdx);

                if (backwards)
                {
                    // have to reset
                    $this.focusLine = $this.kids[params.minIdx];
                    $this.focusOffset = params.start.offset;

                    indexLen = startIdx;
                    for (i = 0; i < $this.startPosition.line.kids.length; i++) {
                        label = $this.startPosition.line.kids[i];
                        if (label.getValue().length > indexLen) {
                            $this.focusLabel = label;
                            break;
                        }
                        indexLen -= label.getValue().length;
                    }
                    $this.clearSelection();
                }
                else
                {
                    //reinstate valid selection
                    $this.clearSelection();
                    $this.startPosition.line = $this.kids[params.minIdx];
                    $this.startPosition.offset = params.start.offset;
                    //$this.endPosition.line = $this.kids[params.maxIdx];
                    //$this.endPosition.offset = params.end.offset;
                    //$this.focusOffset = params.end.offset;
                    //$this.focusLine = $this.kids[params.maxIdx];
                    //$this.focusLineIdx = params.maxIdx;

                    var indexLen = startIdx;
                    for (i = 0; i < $this.startPosition.line.kids.length; i++) {
                        label = $this.startPosition.line.kids[i];
                        if (label.getValue().length > indexLen) {
                            $this.startPosition.label = label;
                            break;
                        }
                        indexLen -= label.getValue().length;
                    }
                }
            }
        },
        function setAlignment()
        {
            var $this=this.edit;
            var minIdx=-1,maxIdx=-1;

            // find the focused Line
            if ($this.focusLine)
            {
                minIdx=$this.kids.indexOf($this.focusLine);
                maxIdx=minIdx;
            }

            // expand to selection lines
            if ($this.hasSelection() && $this.selectionRendered) {
                var params = $this.getSelectedRange();

                if (!(params.minIdx == -1 || params.maxIdx == -1))
                {
                    minIdx=params.minIdx;
                    maxIdx=params.maxIdx;
                }
            }
            if (minIdx == -1 || maxIdx == -1) return;

            // expand to line wrapped lines
            if (minIdx>0)
            {
                var minLine=$this.kids[minIdx];

                if (!$this.getPrevLine(minLine).realLine)
                {
                    var prevLine = $this.getPrevLine(minLine);
                    while (!prevLine.realLine) {
                        minLine=prevLine;
                        prevLine = $this.getPrevLine(minLine);
                        if (minLine.$hash$==prevLine.$hash$)
                        {
                            break;
                        }
                    }
                    minIdx=$this.kids.indexOf(minLine);
                }
            }
            if (maxIdx<$this.kids.length-1)
            {
                var maxLine=$this.kids[maxIdx];

                if (!maxLine.realLine)
                {
                    var nextLine=$this.getNextLine(maxLine);
                    while (!nextLine.realLine) {
                        maxLine=nextLine;
                        nextLine = $this.getNextLine(maxLine);
                    }
                    maxLine=nextLine;
                    maxIdx=$this.kids.indexOf(maxLine);
                }
            }

            var changed=false;

            for (var i=minIdx;i<=maxIdx;i++) {
                if ($this.kids[i].layout.ax!=$this.selectedAlign) {
                    $this.kids[i].setLayout(new zebkit.layout.FlowLayout($this.selectedAlign, "top", "horizontal", 0));
                    changed=true;
                }
            }

            if (changed) $this.makeHistory($this.getOffsetIndex($this.focusLine, $this.focusOffset),$this.kids.indexOf($this.focusLine));
        },
        function colorPicker(target, type, parent, colour, cb)
        {
            if (colour == null) colour = ["0", "0", "0"];
            else if (!Array.isArray(colour)) colour = pkg.parseRgbString(colour);
            else if (colour.length != 3) colour = ["0", "0", "0"];
            else {
                colour.some(function(v) {
                    if (isNaN(Number(v)) || v < 0 || v > 255) {
                        colour = ["0", "0", "0"];
                        return true;
                    }
                })
            }

            var ctr = new zebkit.layout.Constraints();
            ctr.setPadding(10, 5, 0, 5);
            ctr.ax = "right";
            var ctr2 = new zebkit.layout.Constraints();
            ctr2.setPadding(5, 0, 0, 5);
            ctr2.ax = "left";

            function updateColour(n) {
                colour = [n[0], n[1], n[2]];
                r.setValue(n[0].toString());
                g.setValue(n[1].toString());
                b.setValue(n[2].toString());
                showColour.setBackground("rgb(" + r.getValue() + "," + g.getValue() + "," + b.getValue() + ")");

                if(type == "text"){
                    target.selectedColor="rgb(" + r.getValue() + "," + g.getValue() + "," + b.getValue() + ")";
                    parent.setBackground("rgb(" + r.getValue() + "," + g.getValue() + "," + b.getValue() + ")");
                } else if(type == "background") {
                    target.selectedBackground = "rgb(" + r.getValue() + "," + g.getValue() + "," + b.getValue() + ")";
                    parent.setBackground("rgb(" + r.getValue() + "," + g.getValue() + "," + b.getValue() + ")");
                }
                if (typeof cb == "function") cb();
            }


            var colourPalletO = new pkg.Panel();
            colourPalletO.setBackground("rgba(255,255,255,0.0)");

            var colourPalletImage = new pkg.ImagePan(zebkit.ui.pictures.color_pallet);
            colourPalletImage.setPreferredSize(250, 300);
            var colourPallet = new pkg.Panel();
            colourPallet.setLayout(new zebkit.layout.StackLayout());
            colourPallet.setPreferredSize(250, 300);
            colourPallet.add(colourPalletImage);
            colourPallet.add(colourPalletO);

            colourPalletO.extend([
                function pointerPressed(e) {
                    var ctx = this.getCanvas().$layers.win.$context;
                    updateColour(ctx.getImageData(e.absX, e.absY, 1, 1).data);
                }
            ]);
            colourPallet.setPadding(5, 5, 5, 5);


            function rgbBox(rgb) {
                var box = new pkg.TextField("");
                box.setValue(rgb.toString());
                box.setPreferredSize(75, 25);
                // box.setEditable(false);
                box.getModel().on(function (src, bo, off, len, startLine, lines) {
                    var val = src.source.$buf.replace(/[^0-9]+/g, '');
                    if (parseInt(val) > 255) val = '255';
                    if (val == "") val = "0";
                    if (val != src.source.$buf) {
                        src.source.$buf = val;
                        if (src.setValue) src.setValue(val);
                    }
                    //function getArg(o) {
                    //    return o != box ? o.getValue() : val;
                    //}
                    //updateColour([getArg(r), getArg(g), getArg(b)]);
                    box.requestFocusIn(100);
                });
                return box;
            }

            var r = rgbBox(colour[0]);
            r.getModel().on(function () {
                showColour.setBackground("rgb(" + r.getValue() + "," + g.getValue() + "," + b.getValue() + ")");
            });
            var g = rgbBox(colour[1]);
            g.getModel().on(function () {
                showColour.setBackground("rgb(" + r.getValue() + "," + g.getValue() + "," + b.getValue() + ")");
            });
            var b = rgbBox(colour[2]);
            b.getModel().on(function () {
                showColour.setBackground("rgb(" + r.getValue() + "," + g.getValue() + "," + b.getValue() + ")");
            });

            var showColour = new pkg.Panel();
            showColour.setBackground("rgb(" + r.getValue() + "," + g.getValue() + "," + b.getValue() + ")");
            showColour.setPreferredSize(90, 90);
            showColour.setPadding(10, 10, 10, 10);
            showColour.extend([
                function pointerPressed(e) {
                    updateColour([r.getValue(), g.getValue(), b.getValue()]);
                }
            ]);

            var rgbPanel = new pkg.Panel();
            rgbPanel.setLayout(new zebkit.layout.GridLayout(3, 2, "horizontal"));
            rgbPanel.add(ctr, new pkg.Label("R: "));
            rgbPanel.add(ctr2, r);
            rgbPanel.add(ctr, new pkg.Label("G: "));
            rgbPanel.add(ctr2, g);
            rgbPanel.add(ctr, new pkg.Label("B: "));
            rgbPanel.add(ctr2, b);

            var bottomPanel = new pkg.Panel;
            bottomPanel.setLayout(new zebkit.layout.GridLayout(1, 2, "horizontal"));
            bottomPanel.add(rgbPanel);
            bottomPanel.add(showColour);

            var panel = new pkg.Panel();
            panel.setLayout(new zebkit.layout.GridLayout(2, 1, "horizontal"));
            panel.add(colourPallet);
            panel.add(bottomPanel);
            var panelSize = panel.getPreferredSize();
            var panelHeight = panelSize.height;

            var colourModal = new pkg.Window("Pick "+(type=='text'?'Text':'Background')+" Color");
            colourModal.root.add("center", panel);
            colourModal.setBorder(new zebkit.draw.ShadowRender(colourModal.border));
            colourModal.bg = null;
            colourModal.winType = "modal";

            colourModal.setLocation(600, 300);

            colourModal.setSize(260, panelHeight + 50);
            colourModal.setSizeable(false);
            colourModal.buttons.kids[0].on(
                function(e) {
                    target.requestFocus();
                }
            );
            pkg.showModalWindow(parent.getCanvas(),colourModal);
        }
    ]);

});