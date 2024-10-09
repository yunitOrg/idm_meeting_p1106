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
                //   logName: 'GnHNw2gFooUmjW2f/CACLeCvyI1m4lsWrQ34zpoQi0DOIIY6c83ilHvwSquvayLaDMkDjkyyLemBLdtOQ0jh8Jo/Viq5fHLvoBLrUWOeSArN2/gwPSgrXArxjQOETjMOOmc6EyHY36RlaL7KcAEbCp2aLBaCt2zmEX8dR3WnWXg=',
                //   password: 'H9Upld9bWorAG6QgjM8Gpi3QnF5AoSHrhwZn0nSHq4mZFSCUymaZ/46mCq6VksLoROGWWjwNYgNonskjAgejjofvvJDYbUZnSyIxD/0viPt8d5ggWtEaMUsVm7C9fyMV1c7ukXTguGtNvHmMS7d7cuyxOfcWXKGbaUfDKrUT8DQ=',
                //   verifyCode: 1,
                //   // unitId: '1912121746591gjCGWEyAnixZD052E9',
                //   verifyCodeKey: '241008183720LPqELmuS9c7AbchE8PU',
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
