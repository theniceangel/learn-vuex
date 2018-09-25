module.exports = {
  title: 'Vuex源码分析',
  base: '/learn-vuex/',
  head: [],
  description: '逐行级别的 Vuex 源码分析',
  themeConfig: {
    nav: [
      { text: 'Github', link: 'https://github.com/theniceangel/learn-vuex' }
    ],
    sidebar:[
      {
        title: '介绍',
        collapsable: false,
        children: [
          '/introduce/concept',
          '/introduce/origin' 
        ]
      }, {
        title: '源码分析',
        collapsable: false,
        children: [
          '/analyze/vuex',
          '/analyze/store'
        ]
      }
    ]
  }
}