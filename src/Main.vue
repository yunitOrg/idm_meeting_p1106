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
                //   logName: 'Cp5tWl/fqCbEyOzo7vpf+7mNxpaQG1xr0bZdHMtEwHA146HDyPRmaa0q5xb7ZGgsfZAt+gtbSheEiqtNlPzUapcvH8qurdLR1QxS7FFd/2JoR1KZUBgkUu9NCvcGc7POEPnFkmx+pZEXKZqiuEr2xVeAdVv3nbvJ1f0RTkcl9UI=',
                //   password: 'TRts8t5tfWEV6R8UMOph4QU6xQ5GM9PeBfJOrnBW97iEmDCVAYFCHEv/A8ZMTPvbafefN/ZLOGl48xca3DsuB1r7PNWi+vLki0XSqF2IFqih9IkVZaJ/CHF2oKN9z+afCZNqFDk++b0S2qGZ8ljK4diepgt350eQSgLir0rky2A=',
                //   verifyCode: 1,
                //   // unitId: '1912121746591gjCGWEyAnixZD052E9',
                //   verifyCodeKey: '240710093133yq6MVh6D7absKVfM3uN',
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
