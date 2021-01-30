/**
 * Promise
 */

//  先看一个官方的Promise

function getData() {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res("resolve");
    }, 1000);
  });
}

getData()
  .then(
    (res) => {
      console.log(res);
      return "for again";
    }
    // (err) => console.log(err)
  )
  .then((resAgain) => {
    // console.log(resAgain);
  })
  .catch((err) => {
    // console.log(err);
  })
  .finally(() => {
    // console.log("finnally");
  });

/**
 * 以上：
 * 1：new Promise 是一个类
 * 2：then、catch、finally
 * 3：return 的值给下一个then使用
 * 4：支持链式调用
 * 5：then 有两个参数，一个res，一个rej
 * 其他的：
 * 三种状态：只能 pending => fulfilled 或者 pending => rejected
 */

class IPromise {
  // 定义三种状态
  static pending = "pending";
  static fulfilled = "fulfilled";
  static reject = "rejected";

  constructor(executor) {
    // 初始状态未pending
    this.status = IPromise.pending;
    // 成功的返回值
    this.value = undefined;
    // 失败的理
    this.reason = undefined;
    // 存储一个 then 的数组，then会调用多次
    this.callbacks = [];
    //  执行体  new Promise((res,rej)=>{}) 的 (res,rej)=>{}
    executor(this._resolve.bind(this), this._reject.bind(this));
  }

  // onFulfilled 是成功时执行的函数
  // onRejected 是失败时执行的函数
  then(onFulfilled, onRejected) {
    this.callbacks.push({
      onFulfilled,
      onRejected,
    });
  }

  // new Promise 的第一个参数
  _resolve(value) {
    this.value = value;
    // 执行完毕
    this.status = IPromise.fulfilled;
    // 通知事件执行
    this.callbacks.forEach((cb) => this._handler(cb));
  }

  // new Promise 的第二个参数
  _reject(reason) {
    this.reason = reason;
    // 抛出错误
    this.status = IPromise.rejected;
    // 通知事件执行
    this.callbacks.forEach((cb) => this._handler(cb));
  }

  _handler(callback) {
    const { onFulfilled, onRejected } = callback;
    // 根据状态执行对应的函数
    if (this.status === IPromise.fulfilled && onFulfilled) {
      // 传入储存的值
      onFulfilled(this.value);
    }

    if (this.status === IPromise.rejected && onRejected) {
      onRejected(this.reason);
    }
  }
}

function fetchData(success) {
  return new IPromise((resolve, reject) => {
    setTimeout(() => {
      if (success) {
        resolve("willem");
      } else {
        reject("error");
      }
    }, 1000);
  });
}

fetchData(true).then((data) => {
  console.log(data); // after 1000ms: willem
});

fetchData(false).then(null, (reason) => {
  console.log(reason); // after 1000ms: error
});
