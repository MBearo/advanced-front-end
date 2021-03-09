# 不可忽视的前端安全 - 单页应用鉴权设计

安全是计算机科学永远无法忽视的话题。随着互联网的发展，安全问题越来越突出，也越来越重要：它是一个程序可用性、健壮性的基础。这个话题可大可小，大到系统的设计，小到一行代码的写法，都可能影响系统的安全。

毫不例外，安全与前端开发的结合也持续走热。不管是经验丰富的程序员，还是尚在打基础的学生，也许都对 HTTPS、XSS、CSRF 等前端相关的安全问题不陌生。然而，这其中每一个主题都可以非常深入，都能系统地做一节课。但是，我认为面面俱到、走马观花地梳理这些内容，讲解这些概念价值不大。毕竟，这方面知识都已经比较成熟，社区上资料很多。

本讲我想从一个大部分产品都要涉及的登录鉴权入手，结合单页面应用，从这个角度，管中窥豹，尽可能多地涉及一些常见的安全知识，帮助大家了解前端安全。

接下来，让我们从应用场景入手，从前后端交互切入，以单页面应用为基础，呈现“鉴权”这个安全领域重要话题的全貌，并尽力覆盖到 XSS 和 CSRF 等攻击手段以及最佳实践。

关于这个主题的知识点如下：

![](https://images.gitbook.cn/545627c0-4ecf-11e9-97d1-9b2c5e38f63d)

## 单页应用鉴权简介

首先，我们要分清单页应用鉴权与传统鉴权方式有所不同：

单页应用采用前后端分离的设计方式，路由由前端管理，前后端遵循一定规范（如 REST、GraphQL），通过 AJAX 进行通信。在这种情况下，用户对页面请求时，后端经常无法获取用户身份信息，更无法确定返回的数据。

同时一次鉴权完毕后，如何在单页应用的体验当中，保持这个鉴权状态也值得思考。一般来说，单页应用鉴权采用下面的步骤实现。

* Step 1：前端根据用户交互，发送数据请求之前，需要准备用户信息，同数据请求一起发给后端处理。
* Step 2-1：后端按照约定好的规则，根据请求中带有的用户身份信息，进行验证。如果验证不通过，返回 403 或者 401 相关状态码或其他状态，以表示鉴权失败。
* Step 2-2：如果鉴权成功，后端返回相关数据。
* Step 3：前端根据数据渲染视图。

基本结构非常简单清晰：

![](https://images.gitbook.cn/b99cdee0-4eba-11e9-aba8-d90fcdb25340)

在这个结构背后，隐藏的技术方案和安全细节非常值得我们思考，请继续阅读，我们将剖析几个重要概念和安全实践。

### HTTPS

鉴权过程中，如果使用 HTTP 协议来传输敏感数据（用户昵称、用户密码、token……），那么很容易被中间人拦截获取。现代通信中，我们都使用 HTTPS 协议来对传输内容进行加密。关于 HTTPS 的应用及其原理，又是一个超级话题。这里由于内容的限制，不过多展开，给大家分享一下我收藏的关于 HTTPS 好的文章：

* [https 连接的前几毫秒发生了什么](https://mp.weixin.qq.com/s/--KxUNzmBdKtOPBbovWCaA)
* [完全图解 HTTPS](https://juejin.im/post/5c441073e51d455226654d60)
* [更安全的 Web 通信 HTTPS](https://juejin.im/post/5b5f1289e51d4519601aeeda)
* [图解基于 HTTPS 的 DNS](https://www.infoq.cn/article/a-cartoon-intro-to-dns-over-https)
* [看图学 HTTPS](https://juejin.im/post/5b0274ac6fb9a07aaa118f49?utm_medium=fe&utm_source=weixinqun)
* [http 与 https 的区别我真的知道吗](https://juejin.im/post/5af3e002f265da0b7c074ada)
* [深入揭秘 HTTPS 安全问题&连接建立全过程](https://zhuanlan.zhihu.com/p/22142170)
* [HTTPS系列干货（一）：HTTPS 原理详解](http://support.upyun.com/hc/kb/article/1031843/)
* [HTTPS 为什么更安全，先看这些](http://support.upyun.com/hc/kb/article/1031843/https://juejin.im/post/58a8f3295c497d005fbd58b1)

### 不要使用 URL query 传递敏感数据

URL query 会通过服务端日志、浏览器日志、浏览器历史记录查到。不要使用 URL query 传递敏感数据，这当然是最基本的准则之一。如果敏感数据在 URL query 中，这就给了恶意用户轻松获取数据的机会。同时，URL query 的长度也有限制，这也是其传递数据的弊端之一。

### 防止暴力攻击的手段

攻击者可以通过暴力手段，尝试攻破用户的密码等信息。因此后端服务要时刻注意加入频率限制，限制一个用户短时间尝试密码的次数；也可以限制可疑用户（比如触发了过多服务端错误用户）的访问。另外，需要注意的是不要给任何人暴露服务端的技术细节信息，比如要记得关闭 X-Powered-By（服务器响应头隐藏）；Node 端在使用 express.js 的情况下，强烈建议使用 [Helmetjs](https://expressjs.com/en/advanced/best-practice-security.html#use-%20helmet)。

Helmet 帮助 Node.js 开发者通过设置合理的 HTTP header，预防一些常见的 Web 漏洞，比如上面提到的关闭 X-Powered- By。实际上它就是一组灵活的中间件函数，增强以下 HTTP header 的安全性：

* Content-Security-Policy 响应头，它可以设置应用是否可以引用某些来源内容，进而防止 XSS
* 关闭 X-Powered-By 响应头，以避免暴露服务端信息
* 增加 [Public Key Pinning](https://developer.mozilla.org/en-US/docs/Web/Security/Public_Key_Pinning) 响应头，预防中间人伪造证书
* 设置 Strict-Transport-Security 响应头，这样浏览器只能通过 HTTPS 访问当前资源 
* 为 IE8+ 设置 X-Download-Options 响应头，目前只有 IE8+ 支持这个 header，用来预防下载内容的安全隐患
* 设置 Cache-Control 和 Pragma header 以关闭浏览器端缓存
* 设置 X-Content-Type-Options 响应头，以禁用浏览器内容嗅探
* 设置 X-Frame-Options 响应头，以预防 [clickjacking](https://www.owasp.org/index.php/Clickjacking)，这个响应头给浏览器指示是否允许在 `<frame>` 或者 `<iframe>` 标签中渲染某个页面
* 设置 X-XSS-Protection 响应头，当检测到跨站脚本攻击（XSS）时，浏览器停止加载页面

它的使用非常简单：

```text
const express = require('express')
const helmet = require('helmet')

const app = express()

app.use(helmet())
```

其源码是典型的 express 中间件写法，它依次加载相关中间件集。比如它将引用 X-Powered-By 中间件，这个中间件的源码非常简单：

```text
module.exports = function hidePoweredBy (options) {
  var setTo = (options || {}).setTo

  if (setTo) {
    return function hidePoweredBy (req, res, next) {
      res.setHeader('X-Powered-By', setTo)
      next()
    }
  } else {
    return function hidePoweredBy (req, res, next) {
      res.removeHeader('X-Powered-By')
      next()
    }
  }
}
```

通过 setHeader 和 removeHeader 方法，完成对 X-Powered-By 响应头的添加和删除。

### 升级依赖保证安全

现如今我们的应用，大部分脚本都来自第三方依赖，第三方库出现安全隐患的新闻已经屡见不鲜。除了从源头把控依赖的引入外，适时合理地更新 npm 包，是值得倡导的做法，npm 便在 6.0 后有相关命令如下：

```text
# npm 6.0 新增，扫描所有依赖，列出依赖中有安全隐患的包
npm audit
# npm 6.0 新增，扫描所有依赖，并把不安全的依赖包升级到可兼容的版本
npm audit fix
```

## 单页应用鉴权实战

言归正传，我们来看一下实现单页应用鉴权的两种主要手段：

* JWT
* Authentication cookie

**这两种方式不尽相同，我们将逐一分析，并尝试合并这两种方案的优点，将它们结合为第三种方式。**

### 采用 JWT 实现鉴权

在鉴权过程中，为了验证用户的身份，需要浏览器向服务器端提供一个验证信息，我们称为 token。这个 token 通常由 JSON 数据格式组成，通过 hash 散列算法生成一个字符串，称为 JSON Web Token（JSON 表示令牌的原始类型为 JSON 格式，Web 表示在互联网中进行传播，Token 表示令牌，简称 JWT）。任何 token 持有者都可以无差别地用它来访问相关的资源。

我们可以在 HTTP Authorization header 中找到 token，其实就是一个字符串值。这个字符串用来表示用户的身份信息，进行身份认证或者从服务器获取合法资源。当然这个 token 往往是被加密的。那么这个 token 具体是如何生成的呢？

我们先从 JWT 说起，一个 JWT 包含以下 3 个部分：

* header（消息头）
* payload（消息体，储存用户 id、用户角色等） + 过期时间（可选）
* signature（签名）

我们说过，JWT 就是 JSON 格式的数据，JWT 的前两个部分就是 JSON 数据，第三部分 signature 是基于前两部分 header 和 payload 生成的签名。前两部分分别通过 Base64URL 算法生成两组字符串，再和 signature 结合，三部分通过 . 号分割，就是最终的 token。

更多这方面的信息，大家可以参考：

* [5 Easy Steps to Understanding JSON Web Tokens \(JWT\)](https://medium.com/vandium-software/5-easy-steps-to-understanding-json-web-tokens-jwt-1164c0adfcec)
* [Bearer Token](https://www.jianshu.com/p/8f7009456abc)
* [OAuth 2.0: Bearer Token Usage](https://www.cnblogs.com/XiongMaoMengNan/p/6785155.html)

正常来讲，当客户端在提交用户名/密码（或者其他方式）通过认证后，会获得 JWT 的 token，接着通过 JavaScript 脚本，对于所有数据请求都在其 HTTP header 中加上这个 JWT 的 token。服务端接到请求之后，验证 token 的 signature 是否等同于 payload，进而得知 payload 字段是否被中间人更改。

细心的读者可能会发现，我们提到“通过 JavaScript 脚本，对于所有数据请求，都在 HTTP header 中加上这个 token”。这就涉及 **客户端如何存储和维护 JWT** 的问题了。

存储 JWT，我们可以考虑：

* 内存存储
* local/session cookie
* local/session storage……

这几种方式。我并不建议开发者将 token 存储在 local storage 当中，因为：

* 当用户关掉浏览器后，JWT 仍然会被存储在 local storage 中，即便 JWT 过期，可能一直被存储（除非手动更新或清理）
* 任何 JavaScript 都能轻而易举地获得 local storage 的内容
* 无法被 web worker 使用

但在实际项目中，笔者也在 local storage 中存储过 JWT，这需要我们分清利弊，结合实际场景选择方案。如果吃透概念，就能减少 bug 的出现，具体存储方案可以灵活一些。

更好的选择之一是将 JWT 存储在 session cookie 中，auth0 有一篇很好的文章，感兴趣的读者可以参考：[Where to Store Tokens](https://auth0.com/docs/security/store-tokens)。

### JWT 隐患

JWT 实现鉴权也存在的隐患，上面我们也简要提到了，隐患主要来自 [XSS](https://www.owasp.org/index.php/Cross-%20site_Scripting_%28XSS%29)。攻击者可以主动注入恶意脚本或者使用用户输入，通过 JavaScript 代码来偷取 token，接下来便能通过 token 冒充受害用户。

比如，一个博客留言系统，用户可以在其留言内容中加入以下脚本：

```text
<img src=x onerror="&#0000106&#0000097&#0000118&#0000097&#0000115&#0000099&#0000114&#0000105&#0000112&#0000116&#0000058&#0000097&#0000108&#0000101&#0000114&#0000116&#0000040&#0000039&#0000088&#0000083&#0000083&#0000039&#0000041">
```

一般的防御手段是采用 HTML 转义来控制过滤用户输入（为了防止 XSS 攻击，常常需要将用户输入的特殊字符进行转义）。

## 采用 Authentication cookie 实现鉴权

cookie 是含有有效期和相关 domain，存储在浏览器中的键值对组合，可以由 JavaScript 创建：

```text
document.cookie = ‘my_cookie_name=my_cookie_value’
```

也可以由服务端通过 response header 创建：

```text
Set-Cookie: my_cookie_name=my_cookie_value
```

浏览器会自动在每个请求当中加入相关 domain 下的 cookie：

```text
GET https://www.example.com/api/users
Cookie: my_cookie_name=my_cookie_value
```

cookie 一般分为两种（[出处](https://developer.mozilla.org/en-%20US/docs/Web/HTTP/Cookies)）：

> * Session cookie，这种 cookie 会随着用户关闭浏览器而被清除，不会被标记任何过期时间 Expires 或者最大时限 Max- Age。
>   * Permanent cookie，与 session cookie 相反，会在用户关闭浏览器之后被浏览器持久化存储。

&gt;

同时，服务端可以对 cookie 进行一些关键配置，以保障 cookie 的使用安全，诸如：

* HttpOnly cookie：浏览器端 JavaScript 没有读 cookie 权限。
* Secure cookie：传输链路只有在特定安全通道（通常指 HTTPS），请求才会自动加入相关 cookie。
* SameSite cookie：在跨域情况下，相关 cookie 无法被请求携带，这里主要是为了防止 CSRF 攻击。

一个经典场景就是使用 cookie 存储一个 session ID（session ID 由服务端管理，进行创建和计时，以便在必要的时候清除）。通过验证 cookie 和 session ID，服务端便能标记一个用户的访问信息。这种情况就是我们说的 stateful，而本节课的主角 JWT 是 stateless 的，因为它不需要服务端维护 session ID，是无状态的，更加利于横向扩展。

### Authentication cookie 隐患

采用 Authentication cookie 实现单页应用鉴权的安全隐患主要有两种：

* [XSS](https://www.owasp.org/index.php/Cross-site_Scripting_%28XSS%29) 如果没有使用 httpOnly 选项，那么攻击者可能会通过注入恶意脚本，任意读取用户 cookie。而 cookie 直接存储了用户的身份认证信息，这当然是非常可怕的。
* [CSRF](https://www.owasp.org/index.php/Cross-Site_Request_Forgery_%28CSRF%29) 是常见的针对 cookie 展开进攻的手段。我们知道跨域访问技术（CORS，跨域资源共享）的同源策略能保证不同源的客户端脚本在没有明确授权的情况下，无法读写对方资源。同源策略只是针对浏览器侧的编程脚本语言，如果我们对另一个恶意服务器发送 AJAX 请求，同源策略会有所限制，但是如果请求直接通过 HTML form 发送，那么同源策略毫无办法。

另一个利用 CSRF 实施攻击的场景为：假如受害者在网页中登录了 Facebook，同时又打开了 bad.com，bad.com 属于攻击者的网站，这个网站中有这样的代码：

```text
<img src="https://facebook.com/postComment?userId=dupont_123&comment=I_VE_BEEN_HACKED>
```

如此一来，攻击者网站的代码请求了 Facebook 发送个人状态的接口（[https://facebook.com/postComment?），该受害者会莫名其妙地发送一个状态，内容为](https://facebook.com/postComment?），该受害者会莫名其妙地发送一个状态，内容为) "I\_VE\_BEEN\_HACKED"。

**总结** 为了防御 XSS 攻击，需要开发者设置 `httpOnly` 选项；为了防御 XSRF，需要开发者设置 `SameSite` 选项。需要注意，并不是所有浏览器都支持 [SameSite](https://caniuse.com/#feat=same-site-cookie-%20attribute)。

**此外，一些其他防御手段有：**

* Short session timeout：设置 session 过期时间，比如银行网站往往需要每 10 分钟或者更短时间就重新登录。
* 关键操作需要用户重新进行鉴权认证。
* Double submitted cookie：当用户浏览一个站点时，服务端生成一个伪随机数 pseudorandom value，并将其设置为 cookie，且不设置 httpOnly 标识。这样 JavaScript 就能够访问这个 pseudorandom value，并要求在提交每个表单时，一并将这个 pseudorandom value 作为 form value 提交上来，同时在 cookie 中也要提交 value。服务端便可以对比 form value 中的 pseudorandom value 和 cookie value 是否一致，以此来认证用户的安全身份。

Double submitted cookie 之所以能有效防范攻击，是因为同源策略致使攻击者无法读取来自攻击目标服务端的 cookie 值，更无法修改攻击网站的 cookie value。即便攻击者可以从 form 中提交任何 form value，但是无法通过服务端对 form value 中的 pseudorandom value 和 cookie value 的一致性进行验证。

## 混合 JWT 和 cookie 进行鉴权

设想我们要实现这样一个鉴权系统：

* 尽可能抵御 XSS 和 CSRF
* 做到 stateless

考虑到安全性能，JWT 方案的主要问题在于攻击者存在直接读取 JWT 信息的可能。 **如果我们将 JWT 和 cookie 方案结合呢** ？即将 JWT 部分敏感信息放入 cookie 当中，这样一来，便可以结合前文两种方式的优点。

如图，我们再总结一下存在的三种交互可能。第一种是经典 JWT 方式：

![](https://images.gitbook.cn/b54a5600-4eac-11e9-9566-89cb1d9578c6)

这种情况下，前后端使用 JWT 进行鉴权交互，前端通过 JavaScript 操作 JWT 信息完成请求准备。

第二种方式，将 JWT 信息在 session cookie 中维护：

![](https://images.gitbook.cn/ba54c590-4eac-11e9-b1fa-0757868d211c)

在这种情况下，JWT 信息全部存储在 cookie 中， 并设置 cookie 的 httpOnly、SameSite、Secure 属性，前端无法读取 JWT 信息，但每次请求都会由浏览器带上必要的 JWT 数据（作为 cookie）。同时，由于采用 session cookie，也不存在 JWT 信息过期的情况，用户关闭页面之后不会将 JWT 信息持久化存储，下次再打开页面时，会重新进行鉴权流程。

第一种方式有一定的安全隐患；第二种方式我们将 JWT 所有信息存储在 session cookie 当中，优点明显，但是无法做到持久化存储，在某种程度上也会带来不便。那么我们权衡之后进行了变通，结合前面两种方式产生了第三种方式：

![](https://images.gitbook.cn/990f8c00-4eb9-11e9-b0b8-a9c8a3696845)

这样，JWT 的 signature 部分维护在设置了 httpOnly 的 cookie 中，这意味着 JavaScript 无法读取完整的 JWT 信息。同时，cookie 会在每次请求中被携带， 并由服务端返回后在浏览器中进行存储，这样 JWT 信息在每次请求时都可以被更新，JWT 过期时间也会被自动加入。

这篇文章：[Getting Token Authentication Right in a Stateless Single Page Application](https://medium.com/lightrail/getting-token-authentication-right-%20in-a-stateless-single-page-application-57d0c6474e3) 就很好地对上述方式进行了总结。

为了实现最大限度的安全保障，我们也可以考虑结合前文介绍的 Double submitted cookie 以及“关键操作需要用户重新进行鉴权认证”的处理。

例如，我们认为用户更改邮箱地址，是一个关键操作。那么，在发生这个操作时，即便用户已经登录，系统还是要求用户重新填写用户密码，以确认修改。后端在收到修改请求后，产生一个随机 number（经过加密运算），作为 permanent cookie 返回给前端，JavaScript 需要读取这个值，并将这个随机 number 作为表单 form value 的一项，它需要随新的邮箱地址一起提交，服务端对这个随机 form value 进行验证，验证方式是对比表单中的 form value 和 cookie 当中的随机 number 是否一致。

这样便更大限度地防御了 CSRF 攻击，流程如下：

![](https://images.gitbook.cn/c59db7e0-4eac-11e9-b1fa-0757868d211c)

我们总结一下流程。

* Step 1：单页应用检查 cookie 中是否存在 JWT payload，如果存在，表示用户已经成功进行鉴权；反之，重定向到类似 /login 的登录页面。
* Step2：用户在未授权的情况下，在登录页面 /login 将用户名和密码提交给服务端，服务端返回信息中设置 authentication cookie，cookie 中含有 JWT 信息。

第二步的具体操作方法可以采用上述第二种和第三种方式，或者增强 CSRF 防御的其他手段。

## 总结

我们再来总结一下单页应用进行鉴权的关键问题：token 最初由服务端下发，前端在请求时需要携带。这样一来：

* 如果前端将 JWT 存储在 localStorage 或者 sessionStorage 当中，由于 localStorage 或者 sessionStorage 都可以被 JavaScript 访问，如果攻击者能够读取 localStorage 或者 sessionStorage，那么就能轻易获取 token，很容易进行 XSS 攻击。
* 如果将 JWT 存储在 cookie 当中，我们就可以指定 cookie httpOnly 属性，来防止被 JavaScript 读取，也可以指定 secure 属性，来保证 JWT 信息只在 HTTPS 下被携带。但是这样容易遭到 CSRF 攻击，因此就出现了我们的增强方式。

本节我们通过分析和设计单页应用鉴权方案，熟悉了 JWT 和传统 cookie- session。我们在介绍一些安全方面最佳实践的同时，覆盖了一些常见的攻击手段：XSS 和 CSRF 等。前端安全是一个庞大且复杂的课题，本节只是通过一个比较重要的话题带大家切入，要想全面熟悉前端安全，完全可以开一门新课了。虽然我的课程志不在此，不过下面我会根据相关安全话题，将我收藏的文章分享给大家。

课程代码仓库：

[https://github.com/HOUCe/lucas-gitchat-courses](https://github.com/HOUCe/lucas-gitchat-courses)

## 彩蛋分享

### HTTPS 相关

* [https 连接的前几毫秒发生了什么](https://mp.weixin.qq.com/s/--KxUNzmBdKtOPBbovWCaA)
* [完全图解 HTTPS](https://juejin.im/post/5c441073e51d455226654d60)
* [更安全的 Web 通信 HTTPS](https://juejin.im/post/5b5f1289e51d4519601aeeda)
* [图解基于 HTTPS 的 DNS](https://www.infoq.cn/article/a-cartoon-intro-to-dns-over-https)
* [看图学 HTTPS](https://juejin.im/post/5b0274ac6fb9a07aaa118f49?utm_medium=fe&utm_source=weixinqun)
* [http 与 https 的区别我真的知道吗](https://juejin.im/post/5af3e002f265da0b7c074ada)
* [深入揭秘 HTTPS 安全问题&连接建立全过程](https://zhuanlan.zhihu.com/p/22142170)
* [HTTPS系列干货（一）：HTTPS 原理详解](http://support.upyun.com/hc/kb/article/1031843/)
* [HTTPS 为什么更安全，先看这些](http://support.upyun.com/hc/kb/article/1031843/https://juejin.im/post/58a8f3295c497d005fbd58b1)

### 攻防

* [Web 前端攻防，一不小心就中招了](https://juejin.im/entry/58481d33128fe100579cb8c5)
* [聊一聊 WEB 前端安全那些事儿](https://segmentfault.com/a/1190000006672214)
* [常见 Web 安全攻防总结](https://zoumiaojiang.com/article/common-web-security/)
* [前端安全防御指南](http://www.guofengxian.com/2018/01/15/%E5%89%8D%E7%AB%AF%E5%AE%89%E5%85%A8%E9%98%B2%E5%BE%A1%E6%8C%87%E5%8D%97/)
* [对于 XSS 和 CSRF 你究竟了解多少](http://netsecurity.51cto.com/art/201407/446775.htm)
* [浅析前端安全之 XSS](https://mp.weixin.qq.com/s/c_QTdLu6vsYcIiuPRZyjyA)
* [懂这些，你将能构建更安全的 Web 应用](https://juejin.im/entry/5b461d866fb9a04fb745c256)
* [浅说 XSS 和 CSRF](https://juejin.im/entry/5b4b56fd5188251b1a7b2ac1)
* [快速找出网站中可能存在的 XSS 漏洞实践](https://juejin.im/post/5b7bdfa1f265da437174ae0d)
* [前端安全系列之一：如何防止 XSS 攻击？](https://mp.weixin.qq.com/s/kWxnYcCTLAQp5CGFrw30mQ)
* [前端安全系列之二：如何防止 CSRF 攻击？](https://juejin.im/post/5bc009996fb9a05d0a055192)
* [Web 安全漏洞之 XSS 攻击](https://juejin.im/post/5bf214e151882579cf011c2a)
* [前端技术演进（三）：前端安全](https://juejin.im/post/5c137f37f265da6133567735)
* [Preventing CSRF and XSRF Attacks](https://blog.codinghorror.com/preventing-csrf-and-xsrf-attacks/)

### 同源策略和跨域理论相关

* [跨域与同源策略探究](http://blog.w2fzu.com/2018/03/10/2018-04-02-same-origin/)
* [同源策略和跨域请求研究](https://www.cnblogs.com/yincheng/p/cross-domain.html)
* [为什么提交表单不受同源政策限制](https://segmentfault.com/q/1010000011535675/a-1020000011537760)
* [跨域资源共享 CORS 一些知识点](https://juejin.im/post/5ab21717518825611a405da3)
* [Content Security Policy \(CSP\) 介绍](https://juejin.im/entry/5b82b5e56fb9a01a02311b27)
* [30 分钟理解 CORB 是什么](https://juejin.im/post/5b7e826ee51d4538b35c04e8)
* [不要再问我跨域的问题了](https://mp.weixin.qq.com/s/T5gM7M9WsRMSxXzZPDagcA)

### 鉴权

* [讲真，别再使用 JWT 了！](https://www.jianshu.com/p/af8360b83a9f)
* [JWT Token 存储在 Cookie 还是 Web Storage](https://blog.csdn.net/hxg117/article/details/76954606)
* [Getting Token Authentication Right in a Stateless Single Page Application](https://medium.com/lightrail/getting-token-authentication-right-in-a-stateless-single-page-application-57d0c6474e3)
* [登录那些事儿](https://juejin.im/entry/58a298f4128fe100582bf5c1)
* [登录工程：现代 Web 应用的典型身份验证需求](https://juejin.im/entry/58a3d6f561ff4b006c875ee1)
* [前后端常见的几种鉴权方式](https://blog.csdn.net/wang839305939/article/details/78713124)
* [前端关于单点登录的知识](https://juejin.im/post/5b73c71fe51d45666016655a)
* [如何加密传输和存储用户密码](https://juejin.im/post/5af5711e5188254267261e3b)
* [Web 登录其实没那么简单](https://mp.weixin.qq.com/s/G_Grk8YTlu9-0WDZP85xAg)

### CDN 劫持和其他安全问题

* [危险的 target="\_blank" 与 “opener”](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651227961&idx=1&sn=d4eb72b910281a18fc35581e0e39096f&chksm=bd495ebd8a3ed7ab2dcc8d6bbfdd6f336f5b80a301cd3e7f92f56bdd3c95c749d9d6fd77282f&mpshare=1&scene=1&srcid=0310vrk1VnUROjJY9XZ51Hoc)
* [浅谈流量劫持与防治](https://zhuanlan.zhihu.com/p/40682772)
* [短网址安全浅谈](https://security.tencent.com/index.php/blog/msg/126)
* [使用 SRI 解决 CDN 劫持](https://juejin.im/post/5c355a816fb9a049a42f3ac8)
* [了解下 DDoS 攻击方式](https://mp.weixin.qq.com/s/gVLXJO0IXol4q_ademXMWg)
* [主流浏览器图片反防盗链方法总结](https://mp.weixin.qq.com/s/govRdwkNTEBJ1NJ1ipA40w?add=add)

