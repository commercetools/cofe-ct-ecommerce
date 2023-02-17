export class A {
    static m1() {
      console.log('m1 in A');
    }
  
    static m3() {
      console.log('m3 in A');
    }
  
    static m2() {
      console.log('m2 in A');
      this.m3();
    }
  }