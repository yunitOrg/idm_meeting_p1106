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
                //   logName: 'mQDzNkRRNvPar5QA1XdYuhUXtNEFHbQN9KOHVlcTb57IcltQarem1yYAF44tKklv/Wqq6sAW2054qLY7HFtI7PkEZ2nhrHUOUaxmsrcg0DQf9DFn9Jp3YC9zrnf/i8LB9eBqIiuOg6m3hF9trcJnmu8+o1LCd4Rk6wZWrgORR+o=',
                //   password: 'YIi8r/bafEAyA/O/Y7Vmg4jmR4YxOxldOmWwB1T3fz63uGAKG3XCvjvP9RSnkaBU4lIxRiQqc0X4PKarbaXQXeDysNjqInOKjk5tgYGyBIglVcw9fGZKY1UZPuUqjqfvlh3QFGzgMvN2Vt6QneY8Y4MUIqsF1+GmskFUc7ZcW2E=',
                //   verifyCode: 1,
                //   // unitId: '1912121746591gjCGWEyAnixZD052E9',
                //   verifyCodeKey: '240708161737gKyAOZAklDpYmE2LtJS',
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
