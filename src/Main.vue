<template>
    <component :is="`${componentName}`" :ref="`${componentName}`" />
</template>

<script>
export default {
    name: 'Main',
    components: {},
    data() {
        return {
            componentName: '',
        }
    },
    props: {},
    created() {
        this.login()
    },
    methods: {
        login() {
            if ( process.env.NODE_ENV == "development" ) {
                // IDM.http.post('/ctrl/login', {
                //   logName: 'L3eWg1Cn8Zu5KRK3XJdF8tYqelvY73ixjnAfvGW8Lgtf2DxdScD4qs4cDQZgWRxSVY4in3Mphqb6LPrX9M6/FR3xvL7lGpIJis+4dpc/TzRjRkrJG0g84oNkJNgjFvCEhzObM92IPjvMNf7sueg9IJyU4HdlW72xI98ntZq8mBw=',
                //   password: 'VnU4A/TNVehJd9UmwWMYuOS++JWEWLfTsc2gcF1Lnt6ZGpz2faa0cvotVcuLVVZ/gnKHIMwU3iWMY0wOIvy8gM0yI17FtAgoTHN8iUp9W82hikKtx4SvFK09MRVHlXcLwKFWkaZbBSkMBJ6k6IQiVAOfGxmrxtnx68wGpngAQHQ=',
                //   verifyCode: 1,
                //   // unitId: '1912121746591gjCGWEyAnixZD052E9',
                //   verifyCodeKey: '240628165821TlBHHVcm67tolCAeDGx',
                //   w: '1920',
                //   h: '1032',
                //   decrypt: 'RSA',
                // })
            }
        }
    },
    mounted() {
        //这里需要把属性传递，并且把组件注册到核心框架提供的方法，然后这里接收固定的平台提供的几个方法，从而实现双向绑定刷新
        // alert(`${process.env.CodeVar}`)
        this.componentName = this.$root.componentName
        console.log(this.componentName)
    }
}
</script>

<style lang="scss">
@import './style/flex.scss';
</style>
