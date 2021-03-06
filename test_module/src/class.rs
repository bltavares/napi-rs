use std::convert::TryInto;

use napi::{CallContext, JsFunction, JsNumber, JsObject, JsUndefined, Module, Property, Result};

struct NativeClass {
  value: i32,
}

#[js_function(1)]
fn create_test_class(ctx: CallContext) -> Result<JsFunction> {
  let add_count_method = Property::new(&ctx.env, "addCount")?.with_method(add_count);
  let add_native_count = Property::new(&ctx.env, "addNativeCount")?.with_method(add_native_count);
  let properties = vec![add_count_method, add_native_count];
  ctx
    .env
    .define_class("TestClass", test_class_constructor, properties.as_slice())
}

#[js_function(1)]
fn test_class_constructor(ctx: CallContext) -> Result<JsUndefined> {
  let count: i32 = ctx.get::<JsNumber>(0)?.try_into()?;
  let mut this: JsObject = ctx.this_unchecked();
  ctx
    .env
    .wrap(&mut this, NativeClass { value: count + 100 })?;
  this.set_named_property("count", ctx.env.create_int32(count)?)?;
  ctx.env.get_undefined()
}

#[js_function(1)]
fn add_count(ctx: CallContext) -> Result<JsUndefined> {
  let add: i32 = ctx.get::<JsNumber>(0)?.try_into()?;
  let mut this: JsObject = ctx.this_unchecked();
  let count: i32 = this.get_named_property::<JsNumber>("count")?.try_into()?;
  this.set_named_property("count", ctx.env.create_int32(count + add)?)?;
  ctx.env.get_undefined()
}

#[js_function(1)]
fn add_native_count(ctx: CallContext) -> Result<JsNumber> {
  let add: i32 = ctx.get::<JsNumber>(0)?.try_into()?;
  let this: JsObject = ctx.this_unchecked();
  let native_class: &mut NativeClass = ctx.env.unwrap(&this)?;
  native_class.value = native_class.value + add;
  ctx.env.create_int32(native_class.value)
}

#[js_function(1)]
fn new_test_class(ctx: CallContext) -> Result<JsObject> {
  let add_count_method = Property::new(&ctx.env, "addCount")?.with_method(add_count);
  let add_native_count = Property::new(&ctx.env, "addNativeCount")?.with_method(add_native_count);
  let properties = vec![add_count_method, add_native_count];
  let test_class =
    ctx
      .env
      .define_class("TestClass", test_class_constructor, properties.as_slice())?;

  test_class.new(&vec![ctx.env.create_int32(42)?])
}

pub fn register_js(module: &mut Module) -> Result<()> {
  module.create_named_method("createTestClass", create_test_class)?;
  module.create_named_method("newTestClass", new_test_class)?;
  Ok(())
}
