## 运行本项目
```node
git clone git@github.com:xiaohuwei/Tarodemo.git
cd Tarodemo
cnpm i
```


# 手摸手教你使用 Taro+dva+Hooks快速开发小程序

> 最近在研究小程序这方面的东西，使用到了京东基于  `React`  的小程序开发框架 `Taro`  ，相比 `mpvue`  和  `uni-app`  这两个框架来说，`Taro` 显得更优雅，更稳重，大厂在迭代，就是不一样，一句话 ，就是坑少一点～

## 前置知识

看本篇教程前需要你掌握 `dva` ,`React Hooks` ,`Redux` ,还有小程序的开发流程。希望你知其然，并知其所以然。如果你不具备以上任意一点，建议先停下来，下面我给出地址，先自行学习之后再过来看我这篇文章 。

[Redux-React全局状态管理工具之一](https://cn.redux.js.org/)

[dva-让你的全局状态管理更简单](https://dvajs.com/)

[React-用于构建用户界面的 JavaScript 库](https://zh-hans.reactjs.org/)

[React Hooks-更优雅的React应用书写方式](https://zh-hans.reactjs.org/docs/hooks-intro.html)

[小程序](https://developers.weixin.qq.com/miniprogram/dev/framework/)

[Taro-基于React的小程序框架](https://nervjs.github.io/taro/docs/README.html)

------------

## 正式开始

### 安装 Taro脚手架 

```node
# 使用 npm 安装 CLI
$ npm install -g @tarojs/cli
# OR 使用 yarn 安装 CLI
$ yarn global add @tarojs/cli
# OR 安装了 cnpm，使用 cnpm 安装 CLI
$ cnpm install -g @tarojs/cli
```

因为我电脑安装了 `cnpm` 镜像源，所以下文我都会用 `cnpm`

### 脚手架完成后使用脚手架初始化一个新项目

在你需要建立项目的文件夹打开 CMD

```node
taro init test//我们演示的项目名叫test
```

然后跟着流程走，这边为了减少你的学习成本，建议不要选择 `Typescript` ,css选择`less`,模版选择默认模版。

![](https://cdn.xiaohuwei.cn/decb759684ad98ce7e693a3b8ca5255f)

最后成功之后，用你的编辑器打开test目录。

你的目录结构跟我的应该是一样的 

![](https://cdn.xiaohuwei.cn/c0106ffb90631f44cc05d6943168f297)

先删除 `./src/pages`  下面的 `index` 文件夹。

然后命令行在`test` 目录打开，安装我们需要用的扩展

```node
cnpm install --save @tarojs/async-await  //没想到吧 在Taro里面使用 async和 await 需要安装这个扩展
cnpm install --save redux @tarojs/redux @tarojs/redux-h5 redux-thunk redux-logger //Redux全家桶
cnpm install --save dva-core dva-loading  //dva
cnpm install --save taro-axios //在Taro里面使用axios 需要安装他
```

这四个命令安装完之后，打开`./src` 目录 ，新建两个文件夹 ，一个叫  `utils`  一个叫 `models`  注意这两个文件夹应该跟你的 `pages` 文件夹同级。

在 `utils` 文件夹下面新建文件 `dva.js` 写上下面的内容  注册dva

```js
import { create } from 'dva-core';
import { createLogger } from 'redux-logger';
import createLoading from 'dva-loading';
let app;
let store;
let dispatch;

function createApp(opt) {
  // redux日志
  // opt.onAction = [createLogger()];
  app = create(opt);
  app.use(createLoading({}));

  if (!global.registered) opt.models.forEach(model => app.model(model));
  global.registered = true;
  app.start();

  store = app._store;
  app.getStore = () => store;

  dispatch = store.dispatch;

  app.dispatch = dispatch;
  return app;
}
export default {
  createApp,
  getDispatch() {
    return app.dispatch;
  }
}
```

在 `utils` 文件夹下面新建文件 `request.js` 写上下面的内容  封装一个简单的`axios` 实际你的项目中可能不一样

```js
import axios from "taro-axios";
const baseURL = `https://blog.xiaohuwei.cn`
const service = axios.create({
    baseURL: baseURL,
    withCredentials: true, 
    timeout: 300000
});
service.interceptors.response.use(
    response => {
        return response.data;
    },
    error => {
        return Promise.reject(error)
    })

export default service
```

在 `model` 文件夹下面新建文件 `model.js` 写上下面的内容  连接你每个页面的仓库注册到全局

```js
import index from '../pages/index/model';

export default [index];
```

你会发现我们刚才吧 `index` 文件夹已经删除了 ，这里先这样写，后面我在做说明。

下一步 修改 `./src/app.jsx` 作用就是把我们所有的仓库连接进来 方便你学习 下面给出修改后的全部代码

```js
import '@tarojs/async-await'
import Taro, { Component } from '@tarojs/taro'
import Index from './pages/index'
import dva from './utils/dva';
import models from './models/models';
import { Provider } from '@tarojs/redux';
import './app.less'
const dvaApp = dva.createApp({
  initialState: {},
  models: models,
});
const store = dvaApp.getStore();
class App extends Component {
  config = {
    pages: [
      'pages/index/index'
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'black'
    }
  }
  componentDidMount() { }
  componentDidShow() { }
  componentDidHide() { }
  componentDidCatchError() { }
  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render() {
    return (
      <Provider store={store}>
        <Index />
      </Provider>

    )
  }
}
Taro.render(<App />, document.getElementById('app'))
```

---------------

##### 最后一步

在你项目 根目录 ，为了跟我保持一致，希望你在根目录新建一个叫 `page.js的文件`   这个文件我们用来自动生成新页面，包含新页面的 `ui层`  `service层`  和 `model层`方便快速开发。内容如下

```js
/**
 * pages模版快速生成脚本,执行命令 npm run temp `文件名`
 */
const fs = require('fs');
const dirName = process.argv[2];
if (!dirName) {
  console.log('文件夹名称不能为空！');
  console.log('示例：npm run temp test');
  process.exit(0);
}
// 页面模版
const indexTep = `import Taro,{useEffect} from '@tarojs/taro';
import { View,Text } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import './index.less';

const ${titleCase(dirName)} = props =>{
    const {${dirName},loading} = props;
      useEffect(() => {
        console.log(props)
      }, [])
    return (
           <View className="${dirName}-page">
             <Text>正如你所见这是你的${dirName}页面</Text>
           </View>
           )
}
${titleCase(dirName)}.config = {
  navigationBarTitleText: '${dirName}'
}
//全局样式继承 你可以关掉
${titleCase(dirName)}.options = {
  addGlobalClass: true
}
export default connect(
    ({
    ${dirName},
    loading
    })=>({
    ${dirName},
    loading
}))(${titleCase(dirName)})
`;
// less文件模版
const lessTep = `

.${dirName}-page {
}
`;

// model文件模版
const modelTep = `import * as ${dirName}Api from './service';

export default {
  namespace: '${dirName}',
  state: {
      keai:'测试数据666'
  },

  effects: {
    * effectsDemo(_, { call, put }) {
      const { status, data } = yield call(${dirName}Api.demo, {});
      if (status === 'ok') {
        yield put({ type: 'save',
          payload: {
            topData: data,
          } });
      }
    },
  },

  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    },
  },

};
`;


// service页面模版
const serviceTep = `import Request from '../../utils/request';

export const demo = (data) => {
  return Request({
    url: '路径',
    method: 'POST',
    data,
  });
};
`;
fs.mkdirSync(`./src/pages/${dirName}`); // mkdir $1
process.chdir(`./src/pages/${dirName}`); // cd $1

fs.writeFileSync('index.js', indexTep);
fs.writeFileSync('index.less', lessTep);
fs.writeFileSync('model.js', modelTep);
fs.writeFileSync('service.js', serviceTep);
console.log(`模版${dirName}已创建,请手动按照格式增加到./src/models`);
function titleCase(str) {
  const array = str.toLowerCase().split(' ');
  for (let i = 0; i < array.length; i++) {
    array[i] = array[i][0].toUpperCase() + array[i].substring(1, array[i].length);
  }
  const string = array.join(' ');
  return string;
}
process.exit(0);
```

完成之后 去 `package.json` 里面的 `scripts`  添加一条 命令 `  "temp": "node page.js"`

-------

如果你能够走到这一步 ，说明你已经成功了 ，跟我的目录结构 对照一下 

![](https://cdn.xiaohuwei.cn/c377cd8e5e3ed136e08aaa5a62ecff7c)

--------------

命令行在你的项目目录打开，我们来使用 脚本生成第一个页面  index  

```node
npm run temp index
```

你会发现你的`./src/pages` 目录下多了 index 文件夹 并且文件夹下面已经为你初始化好了所有你需要的文件，但是并没有结束。

就是上文提到的 ，每次新建一个页面都需要去 `./src/models/models.js`  手动 按照我给你的格式引入一次，因为我这个组件叫 index，所以我给你的默认就是 index,所以我这里不用改，你做项目的时候，是需要手动加的。

###  试试效果！

```node
npm run dev:weapp
```

![](https://cdn.xiaohuwei.cn/ac2100ee6e97b1c35db0260c48378a01)

好啦，所有的都完成啦，开始开发你的小程序吧！～

---------------

### 说下 Taro的注意事项 

当你 使用到了 图片这些静态资源的时候 ，需要使用 `import`  的语法引用。

如果你想看完整代码  [移步](https://github.com/xiaohuwei/Tarodemo)

