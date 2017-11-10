<template>
  <div id="app" v-cloak>
<!--[if IE]>
<OBJECT id="WebBrowser" height="0" width="0" classid="CLSID:8856F961-340A-11D0-A96B-00C04FD705A2" VIEWASTEXT style="display:none"></OBJECT>
<![endif]-->
<!--
<input onclick="document.all.WebBrowser.ExecWB(6,1)" type="button" value="打印">
<input onclick="document.all.WebBrowser.ExecWB(6,6)" type="button" value="直接打印">
<input onclick="document.all.WebBrowser.ExecWB(8,1)" type="button" value="页面设置">
<input onclick="document.all.WebBrowser.ExecWB(7,1)" type="button" value="打印预览">
-->
    <div class="cmdbar noprint">
		<el-container>
		<el-header style="text-align: left; font-size: 12px;background-color:white;padding:10px;">
		<el-button @click="onLoad" v-if="is_login" type="default" icon="el-icon-upload">加载试题</el-button>
		<el-button @click="onSave" v-if="is_login" type="info" icon="el-icon-circle-plus">保存</el-button>
		<el-button type="default" icon="el-icon-download" @click="exportWord">导出Word文件</el-button>
        <!--[if IE]>
        <input onclick="document.all.WebBrowser.ExecWB(7,1)" type="button" value="打印预览">
        <![endif]-->
		<el-button type="warning" icon="el-icon-printer" @click="doPrint">打印</el-button>&nbsp;
	<el-tooltip class="item" effect="dark" content="点击此按钮立即按当前设置生成试题" placement="bottom-start">
		<el-dropdown split-button type="success" @click="doGen" @command="handleCommand" trigger="click" icon="el-icon-refresh">生成试题！
		<el-dropdown-menu slot="dropdown">
		<el-dropdown-item command="a">100以内加减混合</el-dropdown-item>
		<el-dropdown-item command="b">100以内加减混合(带借/进位)</el-dropdown-item>
		<el-dropdown-item command="c">10以内乘法</el-dropdown-item>
		</el-dropdown-menu>
		</el-dropdown>
	</el-tooltip>
		<span style="float:right">
			访问量：{{mycounter}}
		<el-button @click="onLogin" type="primary" v-if="!is_login">登录</el-button>
		<span v-if="is_login">当前用户：{{curr_user().get('username')}}</span>
		<el-button @click="logout" v-if="is_login">注销</el-button>
		</span>

		</el-header>

		<el-main style="padding:0px;">

		<el-tabs tab-position="left" v-model="activeName" @tab-click="">
			<el-tab-pane label="使用说明" name="first">
			<HelloWorld v-if="0" />
			<img align="middle" src="./assets/logo.png">
				<p>
				小学口算试题生成器 V1.0.1 <br/>
				作者：高大科技 <br/>
				</p>
				<a href="#">点此反馈问题</a>
			</el-tab-pane>
			<el-tab-pane label="基本设置" name="second">
                <table>
                    <tbody>
                    <tr>
                        <td>总题数：</td>
                        <td>
							<el-input-number v-model="count" :min="1" :max="999999" label="总题数"></el-input-number>
						</td>
                    </tr>
                    <tr>
                        <td>每页行数(IE)：</td>
                        <td>
							<el-input-number v-model="pagerows" :min="1" :max="1000" label="每页行数"></el-input-number>
                            共 {{parseInt((res.length + (cols-0) - 1) / (cols-0))}} 行
                            {{parseInt(((parseInt(res.length + (cols-0) - 1) / (cols-0)) + (pagerows - 1)) / (pagerows - 0))}} 页
                        </td>
                    </tr>
                    <tr>
                        <td>尾部补空行：</td>
                        <td><el-switch
							  v-model="appendemptyrows"
							    active-color="#13ce66"
								  inactive-color="#ff4949" border>
							  </el-switch></td>
                    </tr>
                    <tr>
                        <td>列数：</td>
                        <td>
							<el-input-number v-model="cols" :min="1" :max="20" label="列数"></el-input-number>
						</td>
                    </tr>
                    <tr>
                        <td>间距控制：</td>
                        <td>
							<el-input-number v-model="cellPadding" :min="0" :max="99" label="总题数"></el-input-number>空白
							<el-input-number v-model="cellSpacing" :min="0" :max="99" label="总题数"></el-input-number>间距
                        </td>
                    </tr>
                    <tr>
                        <td>字体设置：</td>
                        <td><el-select v-model="fontfamily" placeholder="请选择">
                            <el-option label="宋体" value="宋体"/>
							<el-option label="楷体" value="楷体"/>
							<el-option label="微软雅黑" value="微软雅黑" selected/>
                        </el-select>
							<el-input-number v-model="fontsize" :min="5" :max="100" label="字体大小"></el-input-number>像素
                        </td>
                    </tr>
                </tbody>
                </table>
			</el-tab-pane>
			<el-tab-pane label="详细设置" name="third">
                <table>
                    <tbody>

                    <tr>
                        <td>可用运算符：</td>
                        <td >
							<el-checkbox style="display:inline-block" v-model="isadd" label="加" border/><el-checkbox 
							style="display:inline-block" v-model="issub" label="减" border/><el-checkbox 
							style="display:inline-block" v-model="ismul" label="乘" border/><el-checkbox 
							style="display:inline-block" v-model="isdiv" label="除" border disabled/>
						</td>
                    </tr>
                    <tr>
                        <td>运算规则：</td>
                        <td>
							<el-select v-model="rule" placeholder="请选择">
								<el-option
								label="已知条件，求得数"
								value="1">
								</el-option>
								<el-option
								label="已知得数，求条件"
								value="2">
								</el-option>
							</el-select>
							<el-select v-if="'2'==rule" v-model="whichcond" placeholder="请选择">
								<el-option
								label="随机求条件"
								value="">
								</el-option>
								<el-option
								v-for="(rg, i) in range"
								:key="i"
								:label="'求条件 '+(i+1)"
								:value="i">
								</el-option>
							</el-select>
                        </td>
                    </tr>
                    <tr>
                        <td>借/进位设置：</td>
                        <td>
							<el-tooltip class="item" effect="dark" content="注意借/进位设置只对加/减法起作用" placement="bottom-start">
							<el-select v-model="borrow" placeholder="请选择">
								<el-option
								label="随机决定"
								value="random">
								</el-option>
								<el-option
								label="不要借/进位"
								value="no">
								</el-option>
								<el-option
								label="全都带借/进位"
								value="all">
								</el-option>
							</el-select>
							</el-tooltip>
                        </td>
                    </tr>
                    <tr>
                        <td>运算项个数：</td>
                        <td>
							<el-input-number v-model="itemcount" :min="2" :max="5" label="运算项个数"></el-input-number>个
                        </td>
                    </tr>
                    <tr v-for="(rg, i) in range">
                        <td>运算项{{i+1}}取值范围：</td>
                        <td>
							<el-input-number v-model="rg.min" :min="0" :max="rg.max" label="起始范围"></el-input-number> -
							<el-input-number v-model="rg.max" :min="rg.min" :max="999999" label="结束范围"></el-input-number>
                        </td>
                    </tr>
                    <tr>
                        <td>得数取值范围：</td>
                        <td>
							<el-input-number v-model="result.min" :min="0" :max="result.max" label="起始范围"></el-input-number> -
							<el-input-number v-model="result.max" :min="result.min" :max="999999" label="结束范围"></el-input-number>
                        </td>
                    </tr>

                    </tbody>
                </table>
			</el-tab-pane>
		  </el-tabs>
		<el-alert
		:closable="false"
		title="生成结果"
		type="success"
		show-icon>
		总题数：{{res.length}}，其中：加法：{{report.addcnt}}，减法：{{report.subcnt}}，乘法：{{report.mulcnt}}，除法：{{report.divcnt}}，借/进位：{{report.borrowcnt}}，异常：{{report.exceptcnt}}
		</el-alert>
		</el-main>
		</el-container>
    </div>
    <table ref="mycontent" width="100%" border="0" cellpadding="0" cellspacing="0">
        <thead style="display:table-header-group;">
        <tr>
            <th :colspan="cols">
				<el-popover
				ref="popover1"
				placement="top"
				title="提示"
				width="280"
				trigger="hover"
				content="直接点击页眉区域，可以修改页眉内容。">
				</el-popover>
                <div v-popover:popover1 class="print-repeat" contenteditable="true">
                    <h3>口算（100以内加减法混合运算）</h3>
                    姓名：__________ 日期：____月____日 时间：________ 对题：____道<br/><br/>
                </div>
            </th>
        </tr>
        </thead>
        <tbody>
		<tr v-if="res.length <= 0"><td><el-alert
    title="还没有生成试题！"
    type="error"
    :closable="false">
  </el-alert></td></tr>
        <tr :class="{break_before:p>1}" v-for="p in parseInt(((parseInt(res.length + (cols-0) - 1) / (cols-0)) + (pagerows - 1)) / (pagerows - 0)) ">
            <td style="border: 0px solid;">
                <table :style="{fontFamily:fontfamily, fontSize:fontsize+'px'}" width="100%"  :cellPadding="cellPadding" :cellSpacing="cellSpacing">
                    <tr v-for="r in (appendemptyrows ? (pagerows - 0) : Math.min(pagerows, parseInt((res.length - (p - 1) * (pagerows-0) * (cols-0) + (cols - 1)) / (cols-0))))"
                        :class="{printonly: r > parseInt((res.length - (p - 1) * (pagerows-0) * (cols-0) + (cols - 1)) / (cols-0))}">
                        <td v-for="c in (cols-0)">
                            <template v-if="r > parseInt((res.length - (p - 1) * (pagerows-0) * (cols-0) + (cols - 1)) / (cols-0))">&nbsp;</template>
                            <template v-if="(p-1) * (pagerows-0) * (cols-0) + (r-1) * (cols-0) + (c - 1) < res.length">
                                <span v-for="o in res[ (p-1) * (pagerows-0) * (cols-0) + (r-1) * (cols-0) + (c - 1)].li">{{myfmt(o)}}</span>
                            </template>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        </tbody>
        <tfoot style="display:none;">
        <tr>
            <th :colspan="cols">
                <div class="print-repeat">
                </div>
            </th>
        </tr>
        </tfoot>
    </table>
	<el-dialog
		title="用户登录"
		:visible.sync="loginDialogVisible"
		width="30%"
		:before-close="handleClose">
		<el-form label-width="80px">
		<el-form-item label="用户名">
		<el-input v-model="username"></el-input>
		</el-form-item>
		<el-form-item label="密码">
		<el-input type="password" v-model="password"></el-input>
		</el-form-item>
		</el-form>
		<span slot="footer" class="dialog-footer">
			<el-button @click="loginDialogVisible = false">取消</el-button>
			<el-button @click="register">注册新用户</el-button>
			<el-button type="primary" @click="login">登录</el-button>
		</span>
	</el-dialog>
	<el-dialog
		title="请选择要加载的试卷"
		:visible.sync="paperDialogVisible"
		width="30%"
		>
	<el-table
	height="250"
    ref="singleTable"
    :data="tableData"
    highlight-current-row
    @current-change="handleCurrentChange"
    >
    <el-table-column
      type="index"
      width="50">
    </el-table-column>
    <el-table-column
      property="date"
      label="保存时间"
      width="180">
    </el-table-column>
    <el-table-column
      property="name"
      label="名称"
      width="180">
    </el-table-column>
    <el-table-column
      property="op"
      label="操作"
      >
    </el-table-column>
  </el-table>	
		<span slot="footer" class="dialog-footer">
			<el-button @click="paperDialogVisible = false">取消</el-button>
			<el-button type="danger" @click="doDelData">删除</el-button>
			<el-button type="primary" @click="doLoadData">加载</el-button>
		</span>
	</el-dialog>
  </div>
</template>

<script>
import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import HelloWorld from './components/HelloWorld'

Vue.use(ElementUI)

export default {
  name: 'app',
  components: {
    HelloWorld
  },
  data: function() {
	  return {
		   activeIndex: '1',
		           activeIndex2: '1',
		  activeName: 'first',
		  loginDialogVisible: false,
		  paperDialogVisible: false,
		  tableData: [{
			  date: '2016-05-02',
			  name: '王小虎',
			  address: '上海市普陀区金沙江路 1518 弄'
		  }, {
			  date: '2016-05-04',
			  name: '王小虎',
			  address: '上海市普陀区金沙江路 1517 弄'
		  }, {
			  date: '2016-05-01',
			  name: '王小虎',
			  address: '上海市普陀区金沙江路 1519 弄'
		  }, {
			  date: '2016-05-03',
			  name: '王小虎',
			  address: '上海市普陀区金沙江路 1516 弄'
		  }],
		  currentRow: null,
		mycounter: 0,
		username: '',
		password: '',
		is_login: false,
        count: 100,
        pagerows: 20,
        cols: 4,

		isadd: true,
		issub: true,
		ismul: false,
		isdiv: false,
        level: '20',
        rule: '1',
        whichcond: '',

        itemcount: 0,
        defrange: {min: 0, max:100},
        result: {min: 0, max:100},
        range: [],
        borrow: 'random',
        fontsize: 22,
        fontfamily: '宋体',
        cellPadding: 6,
        cellSpacing: 8,
        res: [],
        appendemptyrows: false,
        report: {
            total: 0,
            addcnt: 0, // 加法题数量
            subcnt: 0, // 减法题数量
			mulcnt: 0,
			divcnt: 0,
            borrowcnt: 0, // 借/进位题数量
            exceptcnt: 0 // 异常题数量(由于冲突，未能按规则生成)
        }
	}
    },
    created: function() {
		Bmob.initialize("cb918bec30eca29246f7101f5ffebafe", "bc68d3c114c13ec55fe79fbb7df3f166");
        this.itemcount = 2;
		this.is_login = this.curr_user() ? true : false;
		this.myCounter();
    },
    watch: {
		count: function(val, oldval) {
			if( val <  1 ) this.count = 1;
			if( val >  100000 ) this.count = 100000;
		},
		pagerows: function(val, oldval) {
			if( val <  1 ) this.pagerows = 1;
			if( val > 100 ) this.pagerows = 100;
		},
		cols: function(val, oldval) {
			if( val <  1 ) this.cols = 1;
			if( val >  10 ) this.cols = 10;
		},
		'result.min': function(val, oldval) {
			if( val <  0 ) this.result.min = 0;
		},
		'result.max': function(val, oldval) {
			if( val <  0 ) this.result.max = 0;
		},
		fontsize: function(val, oldval) {
			if( val <  1 ) this.fontsize = 1;
		},
		cellPadding: function(val, oldval) {
			if( val <  0 ) this.cellPadding = 0;
		},
		cellSpacing: function(val, oldval) {
			if( val <  0 ) this.cellSpacing = 0;
		},
        itemcount: function(val, oldval) {
            if( val < 2 )  {
                this.itemcount = 2;
                return;
            }
            if( val > 5 ) {
                this.itemcount = 5;
                return;
            }
            for (var i = 0; i < val; i ++) {
                if( ! this.range[i] ) {
                    this.range.splice(i, 1, {min: this.defrange.min, max: this.defrange.max});
                }
            }
            if( this.range.length > this.itemcount ) {
                this.range.splice(this.itemcount);
            }
        }
    },
    methods: {
		exportWord: function() {
			var content = this.$refs.mycontent.outerHTML;
			var converted = htmlDocx.asBlob(content, {orientation: 'landscape', margins: {top: 720}});
			saveAs(converted, 'test.docx');
		},
		handleCommand: function(command) {
			this.$message('点击了' + command);
		},
		handleSelect(key, keyPath) {
			        console.log(key, keyPath);
					      },
		handleCurrentChange: function(val) {
			this.currentRow = val;
		},
		handleClose: function(done) {
		},
        op: function() {
			var ops = [];
			if(this.isadd) ops.push('+');
			if(this.issub) ops.push('-');
			if(this.ismul) ops.push('*');
			if(this.isdiv) ops.push('/');
			if( ops.length < 1 ) return '+';
			if( ops.length == 1 ) return ops[0];
			var rnd = parseInt(Math.random()  * 1000) % ops.length;
            return ops[rnd];
        },

        isValid: function(){
			if( ! (this.isadd || this.issub || this.ismul || this.isdiv ) ) {
				alert('必须至少指定一种运算符！');
				return false;
			}
            if(this.result.max - 0 < this.result.min - 0 ) {
                alert('得数范围无效！');
                return false;
            }
            for(var i = 0; i < this.itemcount; i ++) {
                if( this.range[i].max - 0 < this.range[i].min - 0 ) {
                    alert('数值' +(i+1)+'范围无效！');
                    return false;
                }
            }

            // @todo 其它非法检测 ...

            return true;
        },

        genItem: function() {

            // 限制条件：
            // 1. 减法时必须保证第二个数必须比第一个数小，以避免产生负数结果
            // 2. 强制进位加法时，被加数个位必须不能为 0，否则无法产生进位，另外还要保证个位相加之和要大于 10
            // 3. 强制借位减法时，被减数个位必须不能为 9，并且不能小于 10，否则无法产生借位
            // 4. 强制借位减法时，首先必须保证被减数个位小于减数的个位，其次也必须保证减数总体小于被减数，以免产生负数
			// 5. 强制进、借位不对乘除法起作用
			// 6. 除法必须都能整除

            var w = ''===this.whichcond ?  randomInt(0, this.itemcount -1) : this.whichcond - 0; // 已知得数，随机求某一个条件
            var min = this.range[0].min, max = this.range[0].max, limit, isexcept = false, isborrow = false;
            var op = this.op(), t, r, res;

			// @todo: 确保第一个数生成在有解范围内！比如被加数 91 无法保证 加数 >= 10，
			//        比加数为 11，则
			//        如果第一个数随机得不合理，则后面可能无解！
			//        如果个位生成不合理，则后面则可能无法产生借、进位？
			var arr1, rg1;
			
			if( '+' == op ) {
				// 加法：根据结果和加数的限制范围，确定被加数的范围
				rg1 = {min: this.result.min - this.range[1].min, max: this.result.max - this.range[1].min};
			} else if( '-' == op ) {
				// 减法：根据结果和减数的限制范围，确定被减数的范围，确保能在最小的减数上能产生借位
				if( 'all' == this.borrow ) {
					min = Math.max(min, (this.range[1].min - 0) + (this.result.min - 0) + 10); // 强制借位时，必须比减数至少大 10 以上才行!
				} else {
					min = Math.max(min, (this.range[1].min - 0) + (this.result.min - 0)); // 被减数不允许比(减数+得数)还小，这会产生负数结果
				}
				rg1 = {min: (this.result.min - 0) + (this.range[1].min - 0), max: (this.result.max - 0) + (this.range[1].min - 0)};
			} else if( '*' == op ) {
				// 乘法：根据结果和乘数的限制范围，确定被乘数的范围 (注意除数不能为0)
				rg1 = {
					min: (this.range[1].min == 0 ? 0 : Math.round(this.result.min / this.range[1].min)), 
					max: (this.range[1].min == 0 ? this.result.max : Math.round(this.result.max / this.range[1].min))
				};
			} else if( '/' == op ) {
				// @todo 实现除法
				rg1 = {min: this.result.min - this.range[1].min, max: this.result.max - this.range[1].min};
			}

			// 可用范围与用户设置的范围求交集
			arr1 = [min - 0, max - 0, rg1.min, rg1.max].sort(function(a,b){return a-b;});
			min = arr1[1], max = arr1[2];

			//console.log(min, max, arr1);

            // 强制要带借/进位时，对被加/减数有要求
            if( 'all' == this.borrow ) {
                if( '+' == op ) {
                    limit = [0]; // 限制条件：有进位的被加数个位不能为 0.
                } else if( '-' == op ) {
                    min = Math.max(min, 10); // 强制借位减法，被减数不能小于 10，否则会产生负数结果
                    limit = [9]; // 限制条件：有借位的被减数个位不能为 9.
                } else {
					limit = []; // 乘除法对被乘数、被除数没有限制
				}
            }

			//
			// 先生成 r = “被加数"、"被减数"、"被乘数"、"被除数"
			//

            if( '+' == op ) {
                // 加法：数值 1 的最小值都超过了得数允许的最大值，则无法使用加法
                if( min > this.result.max ) {
                    // 智能处理：如果可以使用减法，尝试变更运算符？
                    if( this.issub ) {
                        console.warn('被加数最小值超出了得数允许的最大范围，将智能变更为减法！')
                        op = '-';
                        r = randomInt(min, max, limit);
                    } else {
                        isexcept = true;
                        console.error('错误：被加数最小值超出了得数允许的最大范围！')
                    }
                } else {
                    // 被加数不能超过结果允许的最大值
                    max = Math.min(max, this.result.max);
                    r = randomInt(min, max, limit);
                }
            }
            else if( '-' == op ) {
                // 减法：必须保证被减数不可小于允许结果的最小值
                if( max < this.result.min ) {
					// 如果可以使用加法，尝试变更运算符？
                    if( this.isadd ) {
                        console.warn('被减数最大值比得数允许的最小范围还要小，智能变更为加法！')
                        op = '+';
                        r = randomInt(min, max, limit);
                    } else {
                        isexcept = true;
                        console.error('错误：被减数最大值比得数允许的最小范围还要小！')
                    }
                } else {
                    min = Math.max(min, this.result.min);
                    r = randomInt(min, max, limit);
                }
            }
			else if( '*' == op ) {
				// 乘法：最小的积  比最大结果还大
                if( min > this.result.max ) {
                    if( this.issub ) {
                        console.warn('被乘数最小值超出了得数允许的最大范围，将智能变更为减法！')
                        op = '-';
                        r = randomInt(min, max, limit);
                    } else {
                        isexcept = true;
                        console.error('错误：被乘数最小值超出了得数允许的最大范围！')
                    }
				} else {
                    // 被乘数不能超过结果允许的最大值
                    max = Math.min(max, this.result.max);
					r = randomInt(min, max, limit);
				}
			}
			else if( '/' == op ) {
				// @todo 除法必须保证被除数能除得尽，不能有小数！
                // 除法：必须保证被除数不可小于允许结果的最小值
                if( max < this.result.min ) {
					// 如果可以使用加法，尝试变更运算符？
                    if( this.isadd ) {
                        console.warn('被除数最大值比得数允许的最小范围还要小，智能变更为加法！')
                        op = '+';
                        r = randomInt(min, max, limit);
                    } else {
                        isexcept = true;
                        console.error('错误：被除数最大值比得数允许的最小范围还要小！')
                    }
                } else {
                    min = Math.max(min, this.result.min);
                    r = randomInt(min, max, limit);
                }
			}

            // 如果前面无法生成合法的数值，这里就直接按数值 1 限定范围生成随机数即可！因为无论如何它将是一个异常的值！
            if( 'undefined' == typeof(r) ) {
                r = randomInt(this.range[0].min, this.range[0].max, limit);
            }

            // 已知得数，求条件，且第一个数就是被求的条件? 则将该数使用空白代替！
            var arr = [ ('2' == this.rule && 0 == w ) ? this.blank() : r ];
            for(var i = 1; i < this.itemcount; i ++, op = this.op()) {

                // 强制借/进位时，因为被加/减数的个位已经确定，所以加数的个位取值范围也确定了
                var ge = r % 10, res_ge = [];
                min = ('all' == this.borrow) ? ('+' == op ? 10 - ge : ge + 1) : 0; // 强制借/进位
                max = ('no' == this.borrow) ? ('+' == op ? 9 - ge : ge) : 9; // 强制不借/进位
                for(var j = min; j <= max; j++) {
                    res_ge.push( '+' == op ? (ge + j) % 10 : (ge + 10 - j) % 10);
                }


				// 根据已知的被加/减数、加/减数范围得到得数的范围，然后和用户设置的得数范围合并
				var rgc = {min: eval(r + op + this.range[i].min), max: eval(r + op + this.range[i].max)};
				var rgarr = [rgc.min - 0, rgc.max - 0, this.result.min - 0, this.result.max - 0].sort(function(a, b){
					return a - b;
				});
				// 取两个范围相交的部分
				var rgr = {min: rgarr[1], max: rgarr[2]};

				//console.log('rgr', rgr);

                // 先随机算出得数，再根据得数算出加数/减数 ...
                if( '+' == op ) {
                    // 加法结果范围：被加数(r) ~ rgr.max
                    min = Math.max(r, rgr.min);
                    max = rgr.max;
                    if( min > max ) {
                        console.error('错误：无法保证加法得数在设定范围内！');
                        max = min;
                        isexcept = true;
                    }
                    res = randomInt(min, max, undefined, res_ge);
                    t = res - r;
                }

                if( '-' == op ) {
                    // 减法结果范围：rgr.min ~ 被减数(r)
                    min = Math.max(0, rgr.min);
                    max = Math.min(r, rgr.max);
                    if( min > max ) {
                        console.error('错误：无法保证减法得数在设定范围内！');
                        min = max;
                        isexcept = true;
                    }
                    res = randomInt(min, max, undefined, res_ge);
                    t = r - res;
                }

                if( '*' == op ) {
                    // 乘法结果范围：被乘数(r) ~ rgr.max
                    min = Math.max(r, rgr.min);
                    max = rgr.max;
                    if( min > max ) {
                        console.error('错误：无法保证乘法得数在设定范围内！');
                        max = min;
                        isexcept = true;
                    }
					// @todo 要考虑结果得能除得尽被乘数才行
                    res = randomInt(min, max, undefined, res_ge);
					if( res % r != 0 ) {console.error(res, r, '除不尽');} // 除不尽也没事，后面会重算！就是结果可能超出范围！
					// 被乘数为 0? 乘数随机一个值！
					if( r == 0 ) t = randomInt(this.range[1].min, this.range[1].max); // 0 乘以 任何数都等于 0
					else t = Math.round(res / r); 
                }

				if( '/' == op ) {
                    // 除法结果范围：rgr.min ~ 被减数
                    min = Math.max(0, rgr.min);
                    max = Math.min(r, rgr.max);
                    if( min > max ) {
                        console.error('错误：无法保证除法得数在设定范围内！');
                        min = max;
                        isexcept = true;
                    }
                    res = randomInt(min, max, undefined, res_ge);
                    t = Math.round(r / res);
				}

                if( t < this.range[i].min || t > this.range[i].max) {
                    console.error('错误：为保证得数在范围内，加数/减数将超出范围！', t, this.range[i].min, this.range[i].max);
                    isexcept = true;
                }

                if( 'all' == this.borrow) {
                    if( '+' == op && r % 10 + t % 10 < 10 ) {
                        console.error('错误：未能生成进位！', r, JSON.stringify(res_ge), t, res);
                        isexcept = true;
                    }
                    if( '-' == op && r % 10 >= t % 10 ) {
                        console.error('错误：未能生成借位！', r, JSON.stringify(res_ge), t, res);
                        isexcept = true;
                    }
                }

                if( '+' == op && r % 10 + t % 10 >= 10) isborrow = true; // 有进位
                if( '-' == op && r % 10 < t % 10) isborrow = true; // 有借位

                // 已知得数，求条件时，将条件换成空白
                arr.push(op); // 运算符号
                arr.push(( '2' == this.rule && i == w ) ? this.blank() : t);

                // 计算得数
                r = eval(r + op + t);
            }

            // 得数
            arr.push('=');
            arr.push(( /*true ||*/'2' == this.rule ) ? r : this.blank())

            this.report.addcnt += '+' == op ? 1 : 0;
            this.report.subcnt += '-' == op ? 1 : 0;
            this.report.mulcnt += '*' == op ? 1 : 0;
            this.report.divcnt += '/' == op ? 1 : 0;
            this.report.borrowcnt += isborrow ? 1 : 0;
            this.report.exceptcnt += isexcept ? 1 : 0;

            return arr;
        },

        doGen: function() {
			var self = this;
            if( ! this.isValid() ) {
                return;
            }
			this.$confirm('您确定要重新生成所有试题吗？', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				this.report.total = 0;
				this.report.addcnt = 0; // 加法题数量
				this.report.subcnt = 0; // 减法题数量
				this.report.mulcnt = 0;
				this.report.divcnt = 0;
				this.report.borrowcnt = 0; // 借/进位题数量
				this.report.exceptcnt = 0; // 异常题数量(由于冲突，未能按规则生成)
				this.res = [];
				for(var i = 0; i < this.count; i ++) {
					var item = {
						li: this.genItem()
					};
					this.res.push(item);
				}
			}).catch(() => {
			});
        },

        doPrint: function() {
            if( window.document.all && window.ActiveXObject && !window.opera ) {
                window.document.all.WebBrowser.ExecWB(7,1);
            } else {
                window.print();
            }
			//this.doAddData();
			//this.callServerCode();
        },

		onSave: function() {
			var self = this;
			this.$prompt('请指定一个新的试卷名称', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				inputPattern: /..{0,10}/,
				inputErrorMessage: '试卷名称格式不正确'
			}).then(({ value }) => {
				var GameScore = Bmob.Object.extend("GameScore");
				var gameScore = new GameScore();
				gameScore.set("type", 'paper');
				gameScore.set("user", self.curr_user());
				gameScore.set("name", value);
				gameScore.set("content", JSON.stringify(self.res));
				gameScore.set("crttime", new Date().toISOString());
				gameScore.save(null, {
					success: function(object) {
						self.$message({
							type: 'success',
							message: '试卷保存成功！'
						});
						//self.doGetData(object.id);
					},
					error: function(model, error) {
						alert("create object fail");
					}
				});
			}).catch((e) => {
				console.log(e);
				alert('保存失败');
			});
		},

		onLoad: function() {
			var self = this;
			var GameScore = Bmob.Object.extend("GameScore");
			var query = new Bmob.Query(GameScore);
			query.equalTo("type", 'paper'); 
			query.equalTo("user", this.curr_user()); 
			query.descending("createdAt");
			query.limit(10);
			// 查询所有数据
			query.find({
				success: function(results) {
					//alert("共查询到 " + results.length + " 条记录");
					// 循环处理查询到的数据
					self.tableData = [];
					for (var i = 0; i < results.length; i++) {
						var obj = results[i];
						//alert(obj.id + ' - ' + obj.createdAt + ' - ' + obj.get('content'));
						self.tableData.push({
							id: obj.id,
							date: obj.createdAt,
							name: obj.get('name'),
							content: obj.get('content')
						});
					}
					self.paperDialogVisible = true;
				},
				error: function(error) {
					alert("查询失败: " + error.code + " " + error.message);
				}
			});
/*
			var GameScore = Bmob.Object.extend("GameScore");
			var query = new Bmob.Query(GameScore);
			query.get(obj_id, {
				success: function(object) {
					// The object was retrieved successfully.
					alert(object.get("score"));
				},
				error: function(object, error) {
					alert("query object fail");
				}
			});
*/

		},

		myCounter: function() {
			var self = this;
			var GameScore = Bmob.Object.extend("GameScore");
			var query = new Bmob.Query(GameScore);
			query.get('37bb7543a4', {
				success: function(object) {
					// The object was retrieved successfully.
					self.mycounter = object.get("mycounter");
					object.increment("mycounter");
					object.save(null, {
						success: function(objectUpdate) {
							self.mycounter = objectUpdate.get("mycounter");
						},
						error: function(model, error) {
							alert("create object fail");
						}
					});
				},
				error: function(object, error) {
					//alert("query object fail");
				}
			});
		},

		doEditData: function(obj_id) {
			var GameScore = Bmob.Object.extend("GameScore");
			var query = new Bmob.Query(GameScore);
			query.get(obj_id, {
				success: function(object) {
					// The object was retrieved successfully.
					object.set("score", 1338);
					object.save(null, {
						success: function(objectUpdate) {
							alert("create object success, object score:"+objectUpdate.get("score"));
						},
						error: function(model, error) {
							alert("create object fail");
						}
					});
				},
				error: function(object, error) {
					alert("query object fail");
				}
			});
		},

		doLoadData: function() {
			var self = this;
			if( ! self.currentRow  || 0 >= self.tableData.length ) {
				return;
			}
			this.$confirm('您确定要加载选中的试题吗？', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				self.res = JSON.parse(self.currentRow.content);
				self.$message({
					type: 'success',
					message: `试题加载成功！`
				});
				self.paperDialogVisible = false;
			}).catch(() => {
				alert('加载失败');
			});
		},

		doDelData: function() {
			var self = this;
			if( ! self.currentRow  || 0 >= self.tableData.length ) {
				return;
			}
			this.$confirm('您确定要删除选中的试题吗？', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				var GameScore = Bmob.Object.extend("GameScore");
				var query = new Bmob.Query(GameScore);
				query.equalTo("type", 'paper'); 
				query.equalTo("user", this.curr_user()); 
				query.get(self.currentRow.id, {
					success: function(object) {
						// The object was retrieved successfully.
						object.destroy({
							success: function(deleteObject) {
								self.$message({
									type: 'success',
									message: `试题已被成功删除！`
								});
								self.onLoad();
							},
							error: function(GameScoretest, error) {
								this.$message({
									type: 'error',
									message: `试题删除失败！原因：${error.message}`
								});
							}
						});
					},
					error: function(object, error) {
						alert("query object fail");
					}
				});
			}).catch(() => {
			});
		},

		// 调用云端 node.js 逻辑，收费功能，免费 40 天
		callServerCode: function() {
			Bmob.Cloud.run('myfunc1', {"name":"tom"}, {
				success: function(result) {
					alert('得到结果' + result);
					console.log(result);
				},
				error: function(object, error) {
					alert('发生了错误' +  error.message);
				}
			});
		},

		register: function() {
			var self = this;
			if(!this.username || ! this.password) {
				this.$message({
					type: 'error',
					message: `用户名、密码必须输入！`
				});
				return;
			}
			var user = new Bmob.User();
			user.set("username", this.username);
			user.set("password", this.password);
			//user.set("email", "test@test.com");

			// other fields can be set just like with Bmob.Object
			//user.set("phone", "415-392-0202");

			user.signUp(null, {
				success: function(user) {
					// Hooray! Let them use the app now.
					self.is_login = self.curr_user() ? true : false;
					self.loginDialogVisible = false;
					self.$message({
						type: 'success',
						message: `注册并登录成功！`
					});
				},
				error: function(user, error) {
					// Show the error message somewhere and let the user try again.
					self.$message({
						type: 'error',
						message: `注册失败！错误原因：${error.message}`
					});
				}
			});
		},

		onLogin: function() {
			this.loginDialogVisible = true;
		},

		login: function() {
			var self = this;
			if(!this.username || ! this.password) {
				this.$message({
					type: 'error',
					message: `用户名、密码必须输入！`
				});
				return;
			}
			Bmob.User.logIn(this.username, this.password, {
				success: function(user) {
					// Do stuff after successful login.
					self.is_login = self.curr_user() ? true : false;
					self.loginDialogVisible = false;
					self.$message({
						type: 'success',
						message: `登录成功！`
					});
				},
				error: function(user, error) {
					// The login failed. Check error to see why.
					self.$message({
						type: 'error',
						message: `登录失败！请重新检查您输入的用户名和密码！错误原因：${error.message}`
					});
				}
			});
		},

		verify_email: function() {
			//reset password
			Bmob.User.requestEmailVerify("h6k65@126.com", {
				success: function() {
					// Password reset request was sent successfully
					alert('验证邮件发送成功！');
				},
				error: function(error) {
					// Show the error message somewhere
					alert("Error: " + error.code + " " + error.message);
				}
			});
		},

		reset_pwd: function() {
			Bmob.User.requestPasswordReset("test@126.com", {
				success: function() {
					// Password reset request was sent successfully
					alert('密码重置成功！');
				},
				error: function(error) {
					// Show the error message somewhere
					alert("Error: " + error.code + " " + error.message);
				}
			});
		},

		curr_user: function() {
			var currentUser = Bmob.User.current();
			if (currentUser) {
				// do stuff with the user
			} else {
				// show the signup or login page
			}
			return currentUser;
		},

		logout: function() {
			var self = this;
			Bmob.User.logOut();
			var currentUser = Bmob.User.current();  // this will now be null
			self.is_login = self.curr_user() ? true : false;
			this.$notify({
				title: '提示',
				message: '您已经安全的退出了登录。'
			});
		},

        blank: function() {
            return '___';
        },

		myfmt: function(o) {
			return (o+'').replace('*', '×').replace('/','÷').replace('+','＋').replace('-', '－');
		}
	}

}
</script>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
