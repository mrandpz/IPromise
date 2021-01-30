/*
 * @Author: Mr.pz
 * @Date: 2021-01-30 17:03:19
 * @Last Modified by: Mr.pz
 * @Last Modified time: 2021-01-30 17:42:51
 * 以上一个版本接下去，实现链式调用
 * 实现链式调用的第一个反应是 this，但是使用 this，会在多次调用then的时候，造成 this.value 和 callback的混乱 的混乱
 * 所以采用，每次调用then，也再创建一个promise 对象
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
    // this.callbacks.push({
    //   onFulfilled,
    //   onRejected,
    // });
    // 返回一个新的Promise
    return new IPromise((nextResolve, nextReject) => {
      // 这里之所以把下一个Promise，的nextResolve函数和nextReject也存在callback中
      // 是为了能将onFulfilled的执行结果，通过nextResolve传入到下一个Promise作为它的value值
      this._handler({
        nextResolve,
        nextReject,
        onFulfilled,
        onRejected,
      });
    });
  }

  // new Promise 的第一个参数
  _resolve(value) {
    // 如果 then里面再返回一个promise
    // ?? 这里比较绕，需要将当前内部的这个promise 的 值，再赋值给 当前的 value
    if (value instanceof IPromise) {
      value.then(this._resolve.bind(this), this._reject.bind(this));
      return;
    }
    this.value = value;
    // 执行完毕
    this.status = IPromise.fulfilled;
    // 通知事件执行
    this.callbacks.forEach((cb) => this._handler(cb));
  }

  // new Promise 的第二个参数
  _reject(reason) {
    if (reason instanceof IPromise) {
      reason.then(this._resolve.bind(this), this._reject.bind(this));
      return;
    }
    this.reason = reason;
    // 抛出错误
    this.status = IPromise.rejected;
    // 通知事件执行
    this.callbacks.forEach((cb) => this._handler(cb));
  }

  _handler(callback) {
    const { onFulfilled, onRejected, nextResolve, nextReject } = callback;
    if (this.status === IPromise.pending) {
      this.callbacks.push(callback);
      return;
    }

    if (this.status === IPromise.fulfilled) {
      // 传入储存的值
      const nextValue = onFulfilled ? onFulfilled(this.value) : undefined;
      nextResolve(nextValue);
      return;
    }

    if (this.status === IPromise.rejected) {
      const nextValue = onRejected ? onRejected(this.reason) : undefined;
      nextReject(nextValue);
    }
  }

  // catch 只是 then的一个别名
  catch(onRejected) {
    return this.then(null, onRejected);
  }

  finally(onFinally) {
    return this.then(onFinally, onFinally);
  }
}
function fetchData() {
  return new IPromise((resolve, reject) => {
    setTimeout(() => {
      resolve("willem");
    }, 1000);
  });
}

fetchData()
  .then(
    (data) => {
      return new IPromise((resolve) => {
        setTimeout(() => {
          resolve(data + " wei");
        }, 1000);
      });
    },
    (err) => {}
  )
  .then((data2) => {
    console.log(data2); // willem wei
  });
