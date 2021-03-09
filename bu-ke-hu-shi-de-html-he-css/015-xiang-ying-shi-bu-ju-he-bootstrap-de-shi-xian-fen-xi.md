# 响应式布局和 Bootstrap 的实现分析

响应式这个概念曾经非常流行，但从发展来看，似乎“响应式”布局不再是一个必不可少的话题。究其原因我认为主要有以下几点：

* 公司研发人力越来越充足，PC 端、移动端可以实现两套布局，分项目维护
* 响应式布局适配越来越简单

但是我们仍然不能对这个概念“掉以轻心”，因为响应式布局仍然有其存在的价值：移动端碎片化的现象将会无限期存在；前端也必然进入物联网，任何设备界面的响应布局将会成为关键挑战。除此之外，响应式布局也体现了 CSS 的灵活和发展。

本讲我们就来深入这个话题，相关知识点如下：

![](https://images.gitbook.cn/3dd287e0-90a2-11e9-8b34-c732c3ec276d)

## 上帝视角——响应式布局适配方案

我们首先来梳理一下响应式布局的几种典型方案：

* 传统 float 浮动布局
* 相对单位布局
* 媒体查询
* 基于相对单位 rem 的 flexible 布局
* flex 布局
* grid 布局
* 借助 JavaScript

其中“传统 float 浮动布局”已经在「第3-1课：前端面试离不开的“面子工程”」中有所体现（多栏自适应），这种实现方式比较传统，且能力较弱。

相对单位布局比较容易理解，梳理 CSS 中的相对单位有：

* em
* rem
* vh、vw、vmin、vmax 
* %
* calc\(\) 

重点是理解这些相对单位的使用规范，“到底是相对于谁”（注意，这也是一个很重要的面试考点），比如：

* em 相对于当前元素或当前元素继承来的字体的宽度，但是每个字母或汉字的宽度有可能是不一样的，那么一般来说，就是一个大写字母 M 的宽度（事实上，规范中有一个 x-height 概念，建议取 X 的高度，但并没有推荐绝对的计算执行标准，还需要看浏览器的实现，也有的地方采用 O 的高度）；一个非常容易出错的点在于：很多同学会认为 em 相对于父元素的字体大小，但是实际上取决于应用在什么 CSS 属性上。对于 font-size 来说，em 相对于父元素的字体大小；line-height 中，em 却相对于自身字体的大小。
* rem 相对于根节点（html）的字体大小，根节点一个大写字母 M 的宽度（同上）。

这两个单位在响应式布局中非常重要，我们后续在真实线上适配案例中就能发现，以 rem 为核心，诞生了淘宝的 flexible 响应式布局的方案。

* vw 相对于视口宽度，100vw 就相当于一个视口宽度
* vh 同理，1vh 表示视口高度的 1/100，100vh 就是一个视口高度
* vmin 相对于视口的宽度或高度中较小的那个，也就是 1vw 和 1vh 取最小（Math.min\(1vw, 1vh\)）；vmax 相对于视口的宽度或高度中较大的那个，（Math.max\(1vw, 1vh\)）
* % 的相对对象我们专门挑出来在后续的环节中介绍
* calc 也是一个响应式布局神器，它使得 CSS 有了运算的能力：

```text
width: calc(100vw - 80px)
```

除了相对单位以外，媒体查询（Media Query）以及 flex、grid 布局也都比较好理解。相关内容都容易找到，这里插播一下借助 JavaScript 实现响应式布局的案例，结合上一讲“进击的 HTML 和 CSS”中的 CSS 变量，往往也能简化很多问题：

```text
p {
    height: var(--test-height);
}

function changePHeight (height)
    document.documentElement.style.setProperty('--test-height', `${height}px);
}
```

其实总结下来，这也是一道非常常见的面试题：“你如何实现自适应？如何做到响应式？”，想必大家已经有所了解了。

事实上，所有的响应式布局手段都不是单一的，上述方法搭配使用，效果更明显，也更加简单可行。

下面我们通过分析线上案例（淘宝 + 网易），来了解真实环境下的解决方案。

## 真实线上适配案例分析

在进入分析前，我们先罗列一下其他关于响应式布局的概念：

* 屏幕分辨率
* 像素
* PPI（Pixel Per Inch）：每英寸包括的像素数
* DPI（Dot Per Inch）：即每英寸包括的点数
* 设备独立像素
* 设备像素比（dpr）
* Meta Viewport

不同设备的物理像素尺寸等信息可以参考：[Device Metrics](https://material.io/tools/devices/)。

这些内容都可以在社区上了解到，这里重点分析移动端页面的处理方案。

首先，淘宝通过设置：

![enter image description here](https://images.gitbook.cn/cd1cd750-909f-11e9-afed-87af38460e36)

禁用了用户缩放功能，使页面宽度和设备宽度对齐，一般这种操作也是移动端的响应式适配的标配。

我们观察在页面根节点 HTML 元素上，显式设置了 font-size：

![enter image description here](https://images.gitbook.cn/eebf6030-909f-11e9-8b34-c732c3ec276d)

并且进行试验，当改变浏览器大小时，html 的 font-size 会动态变化。这样不难理解， 采用 rem 作为相对单位的长宽数值，都会随着 resize 事件进行变化（因为 html 的 font-size 动态变化）。我们在其页面当中，不难找到这样的代码：

![enter image description here](https://images.gitbook.cn/0c3a3860-90a0-11e9-afed-87af38460e36)

我将其复制并美化出来，得到：

```text
!function(e, t) {
    var n = t.documentElement,
        d = e.devicePixelRatio || 1;

    function i() {
        var e = n.clientWidth / 3.75;
        n.style.fontSize = e + "px"
    }
    if (function e() {
        t.body ? t.body.style.fontSize = "16px" : t.addEventListener("DOMContentLoaded", e)
    }(), i(), e.addEventListener("resize", i), e.addEventListener("pageshow", function(e) {
        e.persisted && i()
    }), 2 <= d) {
        var o = t.createElement("body"),
            a = t.createElement("div");
        a.style.border = ".5px solid transparent", o.appendChild(a), n.appendChild(o), 1 === a.offsetHeight && n.classList.add("hairlines"), n.removeChild(o)
    }
}(window, document)
```

核心逻辑不难理解，这是一个 IIFE，在 DOMContentLoaded、resize、pageshow 事件触发时，进行对 html 的 font- size 值设定，计算方式：

```text
font-size = document.documentElement.clientWidth / 3.75
```

为什么这么计算呢？我可以肯定的是：淘宝的工程师是按照设计 375px 的视觉稿完成的。在 375px 视觉稿下，html 的 font-size 为 100，那么如果宽度是 75px 的元素，就可以设置为 0.75rem（100  _0.75 = 75px）；当设备宽度为 414px（iPhone8 plus）时，我们想让上述元素的宽度等比例自适应到 82.8px（75_  414 / 375），那么在 CSS 样式为 0.74rem 不变的前提下，想计算得到 82.8px，只需 HTML font-size 变为：110.4px 即可（110.4 \* 0.75 = 82.8）。那么反向过来，这个 110.4 的计算公式就是：

```text
document.documentElement.clientWidth / 3.75
```

当然淘宝实现响应式布局除了依靠 rem 以外，还大量运用了 flex 布局，比如页面中最复杂的布局区块：

![enter image description here](https://images.gitbook.cn/2c80dac0-90a0-11e9-9c86-a1bad3faf0f2)

实现较为简单。

整套解决方案淘宝开源出来，叫做 flexible 布局。其实读到这里，你已经理解了这个解决方案的核心原理。

我们再来看看网易的做法，大体类似：

![enter image description here](https://images.gitbook.cn/52412940-90a0-11e9-9c86-a1bad3faf0f2)

同样采用了 rem 布局，但区别是网易并没有 JavaScript 介入计算 html 的 font-size，而是通过媒体查询和 calc 手段，“枚举”了不同设备下不同的 HTML font-size 值。

在其页面中，较为复杂的头部 slider 组件中：

![enter image description here](https://images.gitbook.cn/9427bc70-90a0-11e9-9c86-a1bad3faf0f2)

slider 宽度明显是 JavaScript 获取设备宽度后动态赋值的（图中为 414px），而高度采用了 rem 布局： 3.7 rem = 55.3px\(calc\(13.33333333vw\) \* 3.7\)

总结一下，响应式布局并没有那么困难，我们需要掌握最基本的处理手段，在实际场景中综合运用多种套路即可实现最大限度的灵活。

## Bootstrap 栅格实现思路

Bootrap 栅格化是一个非常“伟大”的实现，我们在使用 Bootrap 布局时，可以通过添加类的方法，轻松实现栅格化，流式布局。

我们选取代表性的 BS4 官网范例，可以[在线参考](http://v4.bootcss.com/examples/dashboard/#)，或者参看以下截图，在宽屏幕下，我们看到：

![](https://images.gitbook.cn/bfe31c10-90a0-11e9-8b34-c732c3ec276d)

当屏幕宽度小于 576px 时候，我们有：

![](https://images.gitbook.cn/dc19b470-90a0-11e9-9c86-a1bad3faf0f2)

对应代码：

 ... ... ... ...

.col-6 class 样式在源码里面可以简单归纳（不完全）为：

```text
.col-6 {
    -webkit-box-flex: 0;
    -webkit-flex: 0 0 50%;
    -ms-flex: 0 0 50%;
    flex: 0 0 50%;
    max-width: 50%;
}
```

.col-sm-3 class 在源码里面可以归纳为：

```text
.col-sm-3 {
    -webkit-box-flex: 0;
    -webkit-flex: 0 0 25%;
        -ms-flex: 0 0 25%;
            flex: 0 0 25%;
    max-width: 25%;
}
```

我们看到，代码里设置了两个 class：col-6 col-sm-3 进行样式声明。

从上面样式代码里看到类似 `flex: 0 0 25%` 的声明，为了理解它，我们从 flex 属性入手：flex 属性是 flex-grow、flex- shrink 和 flex-basis 的简写（类似 backgroud 是很多背景属性的简写一样），它的默认值为 0 1 auto，后两个属性可选。语法格式如下：

```text
.item {
    flex: none | [ <'flex-grow'> <'flex-shrink'>? || <'flex-basis'> ]
}
```

* flex-grow：属性定义项目的放大比例，默认为 0。我们看到 Bootstrap 代码里这个值一直为 0，即如果存在剩余空间，也不放大。
* flex-shrink：属性定义了项目的缩小比例，默认为 1，即如果空间不足，该项目将缩小。
* flex-basis：属性定义了在分配多余空间之前，项目占据的主轴空间（main size）。

浏览器根据这个属性，计算主轴是否有多余空间，它可以设为跟 width 或 height 属性一样的值（比如 350px），则项目将占据固定空间。

Bootstrap 这里对 flex 设置为比例值，这也是响应式自然而然实现的基础。

但是我们想，很明显 col-6 col-sm-3 的样式属性是有冲突的，那么他们是如何做到“和平共处”交替发挥作用的呢？

事实上：

* 在屏幕宽度大于 576px 时候，会发现 .col-sm-3 并没有起作用，这时候起作用的是 .col-6。

我们在源码里发现 .col-sm-\* 的样式声明全部在

```text
 @media (min-width: 576px) {...} 
```

的媒体查询中，这就保证了在 576px 宽度以上的屏幕，只有在媒体查询之外的 .col-\* 样式声明发挥了作用。

* 在屏幕宽度小于 576px 时候，命中媒体查询，命中 .col-sm-3 的样式声明。它的优先级一定大于 .col-6（媒体查询优先级高），这时候就保证了移动端的样式“占上风”。

再结合 col-6 col-sm-3 的样式声明，我们可以简单总结一下：Bootstrap 主要是通过百分比宽度（max-width: 50%; max- width: 25%;），以及 flex 属性，再加上媒体查询，“三管齐下”实现了栅格化布局的主体。

当然整个过程实现还有很多其他细节，我也一直认为 Bootstrap 的源码是管理大型样式项目的优秀典范，有兴趣的读者可以参阅源码进行了解。

## 横屏适配以及其他细节问题

很多 H5 页面中，我们要区分横屏和竖屏，在不同屏幕下要显示不同的布局，所以我们需要检测在不同的场景下给定不同的样式。通常使用 JavaScript 检查：

```text
window.addEventListener("resize", () => {
    if (window.orientation === 180 || window.orientation === 0) { 
        console.log('竖屏')
    };
    if (window.orientation === 90 || window.orientation === -90 ){ 
        console.log('横屏')
    }  
})
```

我们同样可以使用纯 CSS 来实现不同场景下的布局：

```text
@media screen and (orientation: portrait) {
  /*竖屏样式代码*/
} 
@media screen and (orientation: landscape) {
  /*横屏样式代码.*/
}
```

同时这里我们在总结一下其他常见的响应式布局话题：

* 1px 问题
* 适配 iPhoneX 齐刘海
* 图片自适应

这些问题都可以轻松找到解决思路，我们不再详细给出。

## 面试题：% 相对于谁

在之前的课程《前端面试必不可少的“面子工程”》中我们讲解了实现水平垂直居中的几种方式。其中absolute + transform 方案：

```text
.wp {
    position: relative;
}
.box {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
```

我们用到了不止一处 % 单位。事实上，上述代码中的 % 还真代表着不一样的计算规则。第一处 50% 是指 .wrap 相对定位元素宽度和高度的 50%，而 transform 中的 50% 是指自身元素的宽高的一半。

那么在 CSS 中，这个常见的 % 单位有着什么样的规则呢？这也是一道很好的面试题目，我们在这一部分进行梳理。

* position: absolute 中的 %

对于设置绝对定位 position absolute 的元素，我们可以使用 left right 表示其偏移量，我们把这个元素的祖先元素中第一个存在定位属性的元素成为参照物元素，其中的 % 是相对于参照物的，left 相对于参照物的 width，top 相对于这个参照物的 height。

* position: relative 中的 %

对于设置相对定位 position relative 的元素，% 的数值是相对与自身的，left 相对于自己的 width，top 相对于自己的 height。

* position: fixed 中的 %

对于设置固定定位 position fixed 的元素，% 的数值是相对于视口的，left 相对于视口的 width，top 相对于视口的 height。

* margin 和 padding 的 %

margin 和 padding 当中的 % 非常特殊，它是相对于父元素的宽度。没错，margin-top: 30%，相当于父元素宽度的 30%

* border-radius 的 %

想想我们经常对一个正方形元素设置：

```text
border-radius: 50%
```

得到一个圆形，因此不难发现这里的 % 也是相对于自身宽高的。

* background-size 的 %

background-size 的百分比和 border-radius 一样，也是相对于自身的宽高。

* transform： translate

transform 的 translate 属性 % 是相对于自身的宽高，这也是我们上述代码能够实现居中的原因。

* text-indent 的 %

text-indent 这个属性可以设置首行缩进，当使用 % 时，它是相对于父元素的 width。

* font-size 的 %

相对于父元素的字体大小。

* line-height 的 %

line-height 设置行高时，如果单位为 %，则相对于该元素的 font-size 数值。

这些就是我们常见的使用 % 的情况，还是很灵活多变的，具体细节都可以在 CSS 规范中找到。要求开发者的是了解常见的以及特殊的 % 场景。

## 深入：flex 布局和传统 float 布局性能对比

最后这部分，让我们来深入一个关于性能的话题：

> flex 布局对性能的影响主要体现在哪方面？

这个问题比较“偏门”，很多读者在平时应该没有想过。这里指出来的目的是开拓思路，让我们更加合理地认识 CSS 布局。

我们先思考一下 **flex 布局对性能到底有什么影响，或者有多大影响。**

**首先性能问题一定是一个相对概念** ，flex 布局相比正常的 block layout（non-float）性能开销一定更大。事实上，block layout 永远都是 **single-pass** ，算法进行布局，而 flex 布局却总会激发 **multi-pass codepaths** 算法布局。比如常用的 flex-align: stretch 通常都是 2-pass，这是无可争议且难以避免的短板，天生基因决定。（关于 single- pass 和 multi-pass codepaths，图形学算法问题这里不再展开，读者了解 single-pass 成本更低即可）

口说无凭，我们来做一个对比，display: table VS display: flex。

这里重复 1000 次这样的 DOM：

Item DescriptionAddRemove

分别使用 flex 和 table 布局，并采用 [Navigation Timing API](https://link.zhihu.com/?target=http%3A//www.w3.org/TR/navigation-timing/) 进行布局速度测量。代码如下：

  
        ;\(function TimeThisMother\(\) {  
            window.onload = function\(\){  
                setTimeout\(function\(\){  
                var t = performance.timing;  
                    alert\("Speed of selection is: " + \(t.loadEventEnd - t.responseEnd\) + " milliseconds"\);  
                }, 0\);  
            };  
        }\)\(\);  
    

得到结果：

* flex 布局：Speed of selection is: 248 milliseconds；
* table 布局：Speed of selection is: 282 milliseconds。

flex 布局要比 table 布局似乎更快。

曾经一个名叫 Chris Coyier 的开发者，实现了这样一个 flex 布局生成器。

![enter image description here](https://images.gitbook.cn/16a75430-90a1-11e9-afed-87af38460e36)

注意右上角的滑动条，越向右滑，页面不同颜色区块越多（截图上滚动条已经很短了，证明页面已经很长，布局区块很多），在如此大规模全面使用 flex 布局下，页面丝毫没有任何卡顿。

如上图，打开 Chrome Dev Tools &gt; Timeline，单击 record 按钮，滑动滑块并停止。我们得到瀑布流紫色部分，显示性能效果良好。

当然这样的“模拟”距离真实场景也许较远，不排除如果页面中存在很多图片就会使得性能开销激增，可能使用 flex 某些属性也会付出昂贵的代价。但是一般场景使用，我认为没有必要去担心 flex 布局性能问题，至少它比别的方案靠谱（先不论兼容性）。

**读者可以去 codepen 进行体验：**

[Generate a Crapload of Flexbox​codepen.io![&#x56FE;&#x6807;](https://images.gitbook.cn/4107b7b0-90a1-11e9-8b34-c732c3ec276d)](https://link.zhihu.com/?target=https%3A//codepen.io/chriscoyier/pen/LGmkn)

最后，需要格外提出的是： **新版 flex 布局一般比旧版布局模型更快，同样也比基于浮动的布局模型更快。**

这里来特殊对比一下 flex 布局和浮动布局在性能上的表现。

下图显示了在 1,300 个框上使用浮动的布局开销。

![enter image description here](https://images.gitbook.cn/581b0150-90a1-11e9-8b34-c732c3ec276d)

我们更新此示例以使用 flex，则出现不同的情况：

![enter image description here](https://images.gitbook.cn/71f58140-90a1-11e9-9c86-a1bad3faf0f2)

很明显，对于相同数量的元素和相同的视觉外观，flex 布局的时间要少得多（本例中分别为 3.5 毫秒和 14 毫秒）。对比来源：[developers.google.com](https://link.zhihu.com/?target=http%3A//developers.google.com/)。

**最后，布局性能的开销，一般直接考虑如下因素：**

* 需要布局的元素数量
* 布局的复杂性

相对地， **对于布局性能建议主要有：**

* 应尽可能避免触发布局（layout／reflow）
* 避免强制同步布局和布局抖动

这些面就更大了，我们会在页面性能优化课程中继续这个话题。这里通过结论，想告诉大家的是：不论什么样的布局，在性能上一般很难成为瓶颈。同时另一方面，CSS 看似简单，却也和性能息息相关。

## 总结

这一讲我们分析了实现响应式布局的常用手段，并结合实际案例加以剖析；同时讨论了布局方案对于页面性能的影响。到此为止，HTML 和 CSS 相关的内容终于告一段落了，读者应该能有一个清晰的认识：

* HTML 和 CSS 很重要
* HTML 和 CSS 如果不花心思，也不好学

但是关于 HTML 和 CSS 我们更应该注重实战，也许可以暂时不用“系统化”地去了解，但是遇见一个案例，就去攻克一个案例，慢慢地，你也能成为 HTML 和 CSS 专家！

## 分享交流

阅读文章过程中有任何疑问随时可以跟其他小伙伴讨论，或者直接向作者 LucasHC 提问（作者看到后抽空回复）。 **你的分享不仅帮助他人，更会提升自己。**

你也可以说说自己最想了解的主题，课程内容会根据部分读者的意见和建议迭代和完善。

此外，我们为本课程付费读者创建了《前端开发核心知识进阶》微信交流群，以方便更有针对性地讨论课程相关问题（入群请到第1-2课末尾添加 GitChat 小助手伽利略的微信，并注明「前端核心」，谢谢~）

