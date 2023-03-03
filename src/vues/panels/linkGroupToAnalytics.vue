<!--
Copyright 2020 SpinalCom - www.spinalcom.com

This file is part of SpinalCore.

Please read all of the following terms and conditions
of the Free Software license Agreement ("Agreement")
carefully.

This Agreement is a legally binding contract between
the Licensee (as defined below) and SpinalCom that
sets forth the terms and conditions that govern your
use of the Program. By installing and/or using the
Program, you agree to abide by all the terms and
conditions stated or referenced herein.

If you do not agree to abide by these terms and
conditions, do not demonstrate your acceptance and do
not install or use the Program.
You should have received a copy of the license along
with this file. If not, see
<http://resources.spinalcom.com/licenses.pdf>.
-->

<template>
	<md-content class="mdContent">
		<div class="header">
			<div class="buscar-caja" :class="{ isOpened: isOpened }">
				<input
					type="text"
					name=""
					class="buscar-txt"
					placeholder="Search..."
					:class="{ isOpened: isOpened }"
					v-model="search"
				/>
				<a class="md-icon-button buscar-btn" @click="openSearchBar">
					<md-icon>search</md-icon>
				</a>
			</div>
		</div>

		<div
			v-if="tempList.length > 0 && appState === STATES.normal"
			class="_container"
		>
			<md-content class="listItem md-scrollbar">
				<RecycleScroller
					:items="tempList"
					:item-size="60"
					key-field="id"
					v-slot="{ item }"
				>
					<div class="listContainer">
						<span class="md-list-item-text">{{ item.name }}</span>

						<md-button
							class="md-icon-button panel_link_button"
							@click="linkUnlink(item)"
						>
							<md-icon>{{ getIcon(item) }}</md-icon>
						</md-button>
					</div>
				</RecycleScroller>
			</md-content>
		</div>

		<div
			class="_container empty"
			v-if="tempList.length === 0 && appState === STATES.normal"
		>
			No Data found !
		</div>

		<div class="_container empty" v-if="appState === STATES.loading">
			<md-progress-spinner
				class="spiner"
				md-mode="indeterminate"
			></md-progress-spinner>
		</div>

		<div class="_container empty" v-if="appState === STATES.error">
			Sorry, Something was wrong. Please retry !!
		</div>
	</md-content>
</template>

<script>
	import Vue from "vue";

	import { groupManagerService } from "spinal-env-viewer-plugin-group-manager-service";
	import { spinalAnalyticService } from "spinal-env-viewer-plugin-analytics-service";

	import { RecycleScroller } from "vue-virtual-scroller";

	Vue.component("RecycleScroller", RecycleScroller);

	export default {
		name: "linkGroupToAnalyticPanel",
		components: {
			// "pagination-component": paginationComponent,
			// "filter-menu": filterMenu,
			// "virtual-scroller": VueVirtualScroller,
		},
		data() {
			this.STATES = {
				normal: 1,
				loading: 2,
				error: 3,
			};
			this.contextId;
			this.analyticId;
			this.childrenType;

			this.data = [];

			this.countPerPage = 10;

			return {
				search: "",
				isOpened: false,
				tempList: [],
				dataLinked: [],
				currentPage: 1,
				appState: this.STATES.normal,
			};
		},
		methods: {
			async opened(option) {
				this.appState = this.STATES.loading;
				this.contextId = option.contextId;
				this.analyticId = option.analyticId;
				this.childrenType = option.childrenType;

				Promise.all([
					this.getGroupsLinked(this.analyticId),
					this.getAllGroups(this.childrenType),
				])
					.then(([linked, groups]) => {
						this.data = groups;
						this.tempList = groups;
						this.dataLinked = linked;
						this.appState = this.STATES.normal;
					})
					.catch((err) => {
						this.appState = this.STATES.error;
					});
			},

			isLinked(item) {
				return this.dataLinked.find((el) => {
					return item.id === el.id;
				});
			},

			getIcon(item) {
				return typeof this.isLinked(item) === "undefined"
					? "link"
					: "link_off";
			},

			// eventMethod(eventName, item) {
			// 	EventBus.$emit(eventName, item);
			// },

			openSearchBar() {
				this.isOpened = !this.isOpened;
			},

			async linkUnlink(item) {
				if (!this.isLinked(item)) {
					await spinalAnalyticService.linkGroupToAnalytic(
						this.contextId,
						this.analyticId,
						item.id
					);

					this.dataLinked.push(item);
				} else {
					const removed =
						await spinalAnalyticService.unLinkGroupToAnalytic(
							this.analyticId,
							item.id
						);

					if (removed) {
						this.dataLinked = this.dataLinked.filter(
							(el) => el.id !== item.id
						);
					}
				}
			},

			async getGroupsLinked(analyticId) {
				const groups = await spinalAnalyticService.getGroupsLinked(
					analyticId
				);
				return groups.map((group) => group.get());
			},

			async getAllGroups(type) {
				const contexts = await groupManagerService.getGroupContexts(type);
				const promises = contexts.map((el) => {
					return groupManagerService.getGroups(el.id);
				});

				return Promise.all(promises).then((result) => {
					const _result = result.flat();
					return _result.map((el) => el.get());
				});
			},
		},
		watch: {
			search: function (newValue) {
				newValue = newValue.trim();
				// console.log("newValue", newValue);
				if (newValue.length === 0) {
					this.tempList = [...this.data];
				} else {
					this.tempList = this.data.filter((el) => {
						return el.name.toLowerCase().includes(newValue.toLowerCase());
					});
				}
			},
		},
		// computed: {
		//   isOpened: function() {
		//     return this.search.trim().length > 0;
		//   }
		// }
	};
</script>

<style scoped>
	.mdContent {
		width: 100%;
		height: calc(100% - 15px);
	}

	.header {
		width: 100%;
		height: 40px;
		display: flex;
		flex-direction: row-reverse;
		margin-bottom: 10px;
	}

	._container {
		width: 100%;
		height: calc(100% - 50px);
		overflow: hidden;
	}

	._container .listItem {
		width: 98%;
		height: calc(100% - 10px);
		overflow: hidden;
		overflow-y: auto;
		margin: auto;
	}

	._container .listItem .listcontent {
		width: 95%;
		margin: auto;
	}

	.empty {
		width: 100%;
		height: calc(100% - 50px);
		/* text-align: center; */
		font-size: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.listContainer {
		width: 95%;
		height: 60px;
		font-size: 1.2em;
		padding: 0 5px 0 5px;
		border-bottom: 1px solid white;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.listContainer:hover {
		cursor: pointer;
		background-color: gray;
	}

	.paginationContent {
		width: 40%;
		margin: auto;
		height: 40px;
	}

	.paginationContent {
		width: 100%;
		height: 40px;
	}

	/* .groupColor {
		width: 24px;
		height: 24px;
		border: 1px solid white;
	}

	.spiner {
		position: absolute;
		top: calc(50% - 30px);
		right: calc(50% - 30px);
	} */
</style>

<style>
	.listContainer .md-list-item-content {
		padding-left: 5px;
		/* padding-top: 4px;
  padding-bottom: 4px; */
	}

	.listContainer .panel_link_button .md-ripple {
		padding: unset !important;
	}

	/*
//////////////////////////////////////////////////////////////////
*/

	.buscar-caja {
		/* position: absolute; */
		/* top: 50%;
  left: 50%; */
		/* right: 0; */
		/* transform: translate(-50%, -50%); */
		/* background: #2f3640; */
		height: 35px;
		border-radius: 40px;
		margin-top: 5px;
		/* padding: 10px; */
	}

	.buscar-caja.isOpened {
		background: #2f3640;
	}

	/* .buscar-caja:hover > .buscar-txt, */
	.buscar-caja > .buscar-txt.isOpened {
		width: 240px;
		padding: 0 6px;
	}

	/* .buscar-caja:hover > .buscar-btn {
  background: white;
  color: black;
} */

	.buscar-btn {
		color: #e84118;
		float: right;
		width: 40px;
		height: 35px;
		border-radius: 50%;
		/* background: #2f3640; */
		display: flex;
		justify-content: center;
		align-items: center;
		transition: 0.4s;
		color: white;
		cursor: pointer;
	}

	.buscar-btn > i {
		font-size: 30px;
	}

	.buscar-txt {
		border: none;
		background: none;
		outline: none;
		float: left;
		padding: 0;
		color: white;
		font-size: 16px;
		transition: 0.4s;
		line-height: 40px;
		width: 0px;
		/* font-weight: bold; */
	}

	/*
//////////////////////////////////////////////////////////
//                VUe scroll
//////////////////////////////////////////////////////////
*/
	.vue-recycle-scroller {
		position: relative;
	}
	.vue-recycle-scroller.direction-vertical:not(.page-mode) {
		overflow-y: auto;
	}
	.vue-recycle-scroller.direction-horizontal:not(.page-mode) {
		overflow-x: auto;
	}
	.vue-recycle-scroller.direction-horizontal {
		display: -webkit-box;
		display: -ms-flexbox;
		display: flex;
	}
	.vue-recycle-scroller__slot {
		-webkit-box-flex: 1;
		-ms-flex: auto 0 0px;
		flex: auto 0 0;
	}
	.vue-recycle-scroller__item-wrapper {
		-webkit-box-flex: 1;
		-ms-flex: 1;
		flex: 1;
		-webkit-box-sizing: border-box;
		box-sizing: border-box;
		overflow: hidden;
		position: relative;
	}
	.vue-recycle-scroller.ready .vue-recycle-scroller__item-view {
		position: absolute;
		top: 0;
		left: 0;
		will-change: transform;
	}

	.vue-recycle-scroller.direction-vertical
		.vue-recycle-scroller__item-wrapper {
		width: 100%;
	}

	.vue-recycle-scroller.direction-horizontal
		.vue-recycle-scroller__item-wrapper {
		height: 100%;
	}
	.vue-recycle-scroller.ready.direction-vertical
		.vue-recycle-scroller__item-view {
		width: 100%;
	}
	.vue-recycle-scroller.ready.direction-horizontal
		.vue-recycle-scroller__item-view {
		height: 100%;
	}
	.resize-observer[data-v-b329ee4c] {
		position: absolute;
		top: 0;
		left: 0;
		z-index: -1;
		width: 100%;
		height: 100%;
		border: none;
		background-color: transparent;
		pointer-events: none;
		display: block;
		overflow: hidden;
		opacity: 0;
	}
	.resize-observer[data-v-b329ee4c] object {
		display: block;
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		overflow: hidden;
		pointer-events: none;
		z-index: -1;
	}
</style>
