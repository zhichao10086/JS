;(function($,window,document,undefined) {

    var template =
        '<div style="position:absolute;margin:0 auto;left: 0;right:0;top:0;bottom:0;">' +
            '<div id="_div_cvs" style="z-index:1;" > '+
                '<canvas id="_cvs" style="position: absolute;margin:0 auto;left: 0;right:0;top:0;bottom:0;"></canvas>'+
            '</div>' +
            '<div id="_div_imgs" style="position: relative;margin:0 auto;left: 0;right:0;top:0;bottom:0;">' +
                '<img id="_img_left" style="position:absolute;margin:0 auto;left: 0;right:0;top:0;bottom:0;z-index:2;"> ' +
                '<img id="_img_right" style="position:absolute;margin:0 auto;left: 0;right:0;top:0;bottom:0;z-index:3;">' +
            '</div>'+
            '<div style="clear: both;">' +
            '</div>'+
        '</div>';


    var defaultOptions = {
        canvasWidth:800,
        canvasHeight:800,
        TearingPointNum:5,
        widthOffset:50,
        TearingNum:2,
        LineWidth:5,
        boundColor:"black",
        backgroudColor:"#00000088",
        refreshInterval:300,
        rotateSpeed:1,
        rotateDeg:1,
        rotateFinal:60,
    };

    //插件构造函数
    // 1 初始化 图片、布局等等
    // 2
    function Tearing(targetId,opts) {
        this._init(targetId,opts);
    }

    //1 传入图片
    //2 照片加载
    //3 照片替换
    Tearing.prototype={
        constructor:Tearing,

        //初始化所有用到的变量以及参数 创建控件
        _init :function(targetId,opts){
            if(opts != null)
                defaultOptions = defaultOptions || opts;
            this._initAnimationState();
            this._viewParentId = targetId;
            this._createView();
        },

        _initAnimationState:function(){
            this._viewFinishState = false;
            this._boundFinishState = false;
            this._boundRenderRunningState = false;
            this._rotateFinishState = false;
            this._rotateRenderRunningState = false;
        },

        //创建控件
        _createView:function(){
            this.parentDiv = document.getElementById(this._viewParentId);
            this.parentDiv.innerHTML = template;
            this.parentDiv.style.background = defaultOptions.backgroudColor;
            this.canvas = document.getElementById("_cvs");
            this.cxt = this.canvas.getContext("2d");
            this._viewFinishState = true;
            this._createRandomRGBAArr();

        },

        _createRandomRGBAArr: function(){
            this._ranColorR = window.Util.randomNoSame(1,256,255);
            this._ranColorG = window.Util.randomNoSame(1,256,255);
            this._ranColorB = window.Util.randomNoSame(1,256,255);
            this._ranColorA = window.Util.randomNoSame(1,256,255);
        },

        //设置像素图片
        setImage:function(image){
            //这个为img对象
            this.image = image;
            this.canvas.width = this.image.width;
            this.canvas.height = this.image.height;
            this._calculateTearingBound();
        },

        //清空画布
        _clearCanvas:function(cxt){
            cxt.clearRect(0,0,this.canvas.width,this.canvas.height);
        },

        draw:function(){
            this.timerRender = setInterval(this._render.bind(this),5);
        },

        _render:function(){
            //根据不同的状态来判断进行的步骤，类似于状态机
            if(!this._viewFinishState){
                this._createView();
                this._viewFinishState = true;
            }else if(!this._boundFinishState){
                if(!this._boundRenderRunningState){
                    this._drawTearingBound();
                    this._boundRenderRunningState = true;
                    this.timerDrawBound = setInterval(this._renderTearingBound.bind(this),defaultOptions.refreshInterval);
                }
            }else if(!this._rotateFinishState){
                if(!this._rotateRenderRunningState){
                    this._insertImage();
                    this._rotateRenderRunningState = true;
                    this.timerRotate = setInterval(this._renderTearingRotate.bind(this),defaultOptions.refreshInterval);
                }
            }else{
                this._initAnimationState();
                window.clearInterval(this.timerRender);
            }
        },

        _drawTearingBound:function(){
            this.cxt.drawImage(this.image,0,0);
            this.cxt.lineWidth = defaultOptions.lineWidth;
            this.cxt.strokeStyle= defaultOptions.boundColor;
            this._pointCount = 0;
            //this.timerDrawBound = setInterval(this._renderTearingBound.bind(this),500);
        },

        _renderTearingBound:function(){
            if(this._pointCount >= defaultOptions.TearingPointNum){
                //绘制完毕 清除边界绘制状态。
                window.clearInterval(this.timerDrawBound);
                this._pointCount = 0;
                this._boundFinishState = true;
                this._boundRenderRunningState = false;
                return;
            }
            if(this._pointCount == 0){
                this.cxt.moveTo(this._tearingPoints[this._pointCount].x,this._tearingPoints[this._pointCount].y);
            }else {
                this.cxt.lineTo(this._tearingPoints[this._pointCount].x,this._tearingPoints[this._pointCount].y);
            }
            this._pointCount++;
            this.cxt.stroke();
        },

        //旋转刷新
        _renderTearingRotate:function(){
            var deg = defaultOptions.rotateSpeed*defaultOptions.rotateDeg*this._rotateCount;
            if(deg > defaultOptions.rotateFinal){
                window.clearInterval(this.timerRotate);
                this._rotateCount =0;
                this._rotateFinishState = true;
                this._rotateRenderRunningState = false;
                return;
            }
            $("#_img_left")[0].style.WebkitTransform = "rotate(-"+deg+"deg)";
            $("#_img_right")[0].style.WebkitTransform = "rotate("+deg+"deg)";

            this._rotateCount++;
        },

        //将分裂后的图片插入到网页中
        _insertImage:function(){
            this._createLeftAndRight();
            //$("#_div_cvs")[0].style.height = 0;
            //half_width = Math.sqrt(this.image.width*this.image.width/2 +this.image.height*this.image.height);
            //$("#_div_imgs").width(half_width*2);
            //$("#_div_imgs").height(half_width*2);
            //$("#_img_left").css("left",half_width-this.image.width/2);
            //$("#_img_right").css("left",half_width-this.image.width/2);
            $("#_img_left").attr("src", this._pieceImageSrcArr[1]);
            $("#_img_right").attr("src", this._pieceImageSrcArr[0]);
            //$("#_img_left")[0] = this._pieceImageArr[1];
            //$("#_img_right")[0] = this._pieceImageArr[0];
            //this._renderTearingRotate();
            $("#_img_left")[0].style.WebkitTransformOrigin = "50% 100%";
            $("#_img_right")[0].style.WebkitTransformOrigin = "50% 100%";
            this._rotateCount = 0;
            //this.timerRotate = setInterval(this._renderTearingRotate.bind(this),40);

        },

        //制作左右图片
        _createLeftAndRight:function(){
            this._pieceImageArr = new Array();
            this._pieceImageSrcArr = new Array();
            this.cxt.lineWidth = defaultOptions.lineWidth;
            this.cxt.strokeStyle = defaultOptions.boundColor;
            for(var i =0;i<this._tearingBoundPointsArr.length;i++){
                this.cxt.drawImage(this.image,1,1);
                this.cxt.save();
                this.cxt.beginPath();
                this.cxt.moveTo(this._tearingBoundPointsArr[i][0].x,this._tearingBoundPointsArr[i][0].y);
                for(var j = 1;j<this._tearingBoundPointsArr[i].length;j++){
                    this.cxt.lineTo(this._tearingBoundPointsArr[i][j].x,this._tearingBoundPointsArr[i][j].y);
                    //this.cxt.moveTo(this._tearingBoundPointsArr[i][j].x,this._tearingBoundPointsArr[i][j].y);
                }
                this.cxt.lineTo(this._tearingBoundPointsArr[i][0].x,this._tearingBoundPointsArr[i][0].y);
                this.cxt.stroke();
                this.cxt.clip();
                this._clearCanvas(this.cxt);
                this._pieceImageSrcArr.push(this.canvas.toDataURL("image/png"));
                var image = new Image();
                image.src = this._pieceImageSrcArr[i];
                this._pieceImageArr.push(image);
                this.cxt.restore();
            }
            this._clearCanvas(this.cxt);
        },

        _getImageData:function(){
            this.cxt.drawImage(this.image,0,0);
            var imageData = this.cxt.getImageData(0,0,this.image.width,this.image.height);
            this._clearCanvas(this.cxt);
            return imageData;
        },

        //计算撕裂点
        _calculateTearingBound:function(){
            var img = this._getImageData();
            var imgData = img.data;
            var imgWidthCenter = Math.floor(img.width/2);
            //计算每个点的相对高度移动
            var heightOffset = Math.floor(img.height/(defaultOptions.TearingPointNum-1));
            this._tearingPoints = new Array();
            //第一个点为中点
            this._tearingPoints.push({x:imgWidthCenter,y:0});
            for (var i = 1;i < defaultOptions.TearingPointNum -1;i++){
                var y = this._tearingPoints[i-1].y + heightOffset;
                if (i%2 == 0){
                    var x = window.Util.randomNum(imgWidthCenter -
                        defaultOptions.widthOffset,imgWidthCenter);
                }else {
                    var x = window.Util.randomNum(imgWidthCenter,
                        imgWidthCenter + defaultOptions.widthOffset);
                }
                this._tearingPoints.push({x:x,y:y});
            }
            this._tearingPoints.push({x:imgWidthCenter,y:img.height});

            //将边界点都装入数组里方便绘制
            this._tearingBoundPointsArr = new Array();
            var left  = new Array();
            var right = new Array();
            $.extend(true,left,this._tearingPoints);
            $.extend(true,right,this._tearingPoints);
            left.push({x:0,y:img.height});
            left.push({x:0,y:0});
            right.push({x:img.width,y:img.height});
            right.push({x:img.width,y:0});
            this._tearingBoundPointsArr.push(left);
            this._tearingBoundPointsArr.push(right);
        },

    };

    window.Tearing = Tearing;



}($,window,document));
