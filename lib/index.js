// dsh-safe-input —— 宿主半边。
//
// 本插件不需要任何宿主能力：全部界面都在浏览器半边（lib/client.js）。
// 这里保留一个最小的 Cordis 插件行，让 bundle patch 的 insert 有落点。

export const name = 'dsh-safe-input'

export const inject = []

export function apply(ctx) {
  // 有意为空：界面由 dsh.client 清单加载的浏览器半边注册。
  void ctx
}
