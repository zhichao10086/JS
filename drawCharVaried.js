;(function($,window,document,undefined) {

    var _global;

    var template = '<div id="_div_cvs"> '+
        '<canvas id="_cvs"></canvas>'+
        '</div>';

    var defaultOptions = {
        canvasWidth:1000,
        canvasHeight:1000,
    };

    //插件构造函数
    // 1 初始化 图片、布局等等
    // 2
    function DrawCharVaried(targetId,opts) {
        this._init(targetId,opts);
    }


    //1 传入图片
    //2 照片加载
    //3 照片替换
    DrawCharVaried.prototype={
        constructor:DrawCharVaried,

        //初始化所有用到的变量以及参数 创建控件
        _init :function(targetId,opts){
            this.options = defaultOptions || opts;
            this.create(targetId);

        },

        //创建控件
        create:function(targetId){
            this.parentDiv = document.getElementById(targetId);
            this.parentDiv.innerHTML = template;
            this.canvas = document.getElementById("_cvs");
            this.cxt = this.canvas.getContext("2d");
            this.canvas.width = this.options.canvasWidth;
            this.canvas.height = this.options.canvasHeight;
            this.blackFlagArr = new Array();
            this.blackBoundFlagArr = new Array();
            this.blackIndexArr = new Array();
            this.blackBoundIndexArr = new Array();

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
            this._calculateDrawArea();
        },
        //清空画布
        _clearCanvas:function(){
            this.cxt.clearRect(0,0,this.canvas.width,this.canvas.height);
        },
        draw:function(){
            this._drawTimedRefresh();
        },


        _drawTimedRefresh:function(){
            setInterval(this._drawVariedColour.bind(this),500);

        },

        //绘制不同颜色边界
        _drawVariedColourBound:function(){
            this._clearCanvas();
                var randomArr = window.Util.randomNoSame(1,this.blackFlagArr.length,this.blackFlagArr.length/5);
                var newImage = this.cxt.createImageData(this.image.width,this.image.height);
                for (var i = 0; i<randomArr.length;i++){
                    var index = this.blackBoundIndexArr[randomArr[i]-1]*4;
                    var ran = window.Util.randomNum(0,255);
                    newImage.data[index] = this._ranColorR[ran]-1 ;
                    newImage.data[index+1] = this._ranColorG[ran]-1 ;
                    newImage.data[index+2] = this._ranColorB[ran]-1;
                    newImage.data[index+3]=255;
                }
                this.cxt.putImageData(newImage,0,0);

        },

        //绘制不同颜色
        _drawVariedColour:function(){
            this._clearCanvas();
            var randomArr = window.Util.randomNoSame(1,this.blackFlagArr.length,10000);
            var newImage = this.cxt.createImageData(this.image.width,this.image.height);
            for (var i = 0; i<randomArr.length;i++){
                var index = this.blackIndexArr[randomArr[i]-1]*4;
                var ran = window.Util.randomNum(0,255);
                newImage.data[index] = this._ranColorR[ran]-1 ;
                newImage.data[index+1] = this._ranColorG[ran]-1 ;
                newImage.data[index+2] = this._ranColorB[ran]-1;
                newImage.data[index+3]=255;
            }
            this.cxt.putImageData(newImage,0,0);

        },

        _getImageData:function(){
            this.cxt.drawImage(this.image,0,0);
            var imageData = this.cxt.getImageData(0,0,this.image.width,this.image.height);
            this._clearCanvas();
            return imageData;
        },
        //计算绘图面积
        _calculateDrawArea:function(){
            var img = this._getImageData();
            var imgData = img.data;
            var blackFlagArr = new Array(imgData.length/4);
            var blackBoundFlagArr = new Array(blackFlagArr.length);
            var blackIndexArr = new Array();
            var blackBoundIndexArr = new Array();


            for (var i = 0,j=0; i<imgData.length;i+=4,j++){
                if (isBlack(imgData[i],imgData[i+1],imgData[i+2])){
                    // 标记黑色区域
                    blackFlagArr[j] = 1;
                    blackIndexArr.push(j);
                }else {
                    blackFlagArr[j] = 0
                    imgData[i+3] = 0;
                }
            }
            //查找黑色边缘
            for (var i = 0; i<blackFlagArr.length;i++){
                if (blackFlagArr[i] == 1){
                    // 标记黑色区域
                    //比较上方
                    if (i >= imgData.width){
                        if (blackFlagArr[i-img.width] == 0){
                            blackBoundFlagArr[i] = 1;
                            blackBoundIndexArr.push(i);
                            continue;
                        }
                    }
                    //比较下方
                    if (i < imgData.length - img.width){
                        if (blackFlagArr[i+img.width] == 0){
                            blackBoundFlagArr[i] = 1;
                            blackBoundIndexArr.push(i);
                            continue;
                        }
                    }
                    //比较左边
                    if (i%img.width != 0){
                        if (blackFlagArr[i-1] == 0){
                            blackBoundFlagArr[i] = 1;
                            blackBoundIndexArr.push(i);
                            continue;
                        }
                    }
                    //比较右边
                    if ((i+1)%img.width!= 0){
                        if (blackFlagArr[i+1] == 0){
                            blackBoundFlagArr[i] = 1;
                            blackBoundIndexArr.push(i);
                            continue;
                        }
                    }
                    // 如果不符合就设为零
                    blackBoundFlagArr[i] = 0;
                }else {
                    blackBoundFlagArr[i] = 0;
                }
            }
            //这个为从canvas中拿出的image像素对象
            this.imageData = imgData;
            this.blackFlagArr = blackFlagArr;
            this.blackBoundFlagArr = blackBoundFlagArr;
            this.blackIndexArr = blackIndexArr;
            this.blackBoundIndexArr = blackBoundIndexArr;
        }


    };

    window.DrawCharVaried = DrawCharVaried;



}($,window,document));
