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
	<md-dialog
		class="mdDialogContainer"
		:md-active.sync="showDialog"
		@md-closed="closeDialog(false)"
	>
		<md-dialog-title class="dialogTitle">Create Entity </md-dialog-title>
		<md-dialog-content class="content">
			<md-field>
				<label>Name</label>
				<md-input v-model="entity.name"></md-input>
			</md-field>

			<md-field>
				<label>Standard name</label>
				<md-input v-model="entity.standard_name"></md-input>
			</md-field>

			<md-field>
				<label for="entityType">Entity type</label>
				<md-select
					v-model="entity.entityType"
					name="entityType"
					id="entityType"
				>
					<md-option
						v-for="data of Object.keys(types)"
						:key="data"
						:value="data"
						>{{ data }}</md-option
					>
				</md-select>
			</md-field>
		</md-dialog-content>
		<md-dialog-actions>
			<md-button class="md-primary" @click="closeDialog(false)"
				>Close</md-button
			>
			<md-button
				class="md-primary"
				:disabled="disabled()"
				@click="closeDialog(true)"
				>Save</md-button
			>
		</md-dialog-actions>
	</md-dialog>
</template>

<script>
	import {spinalAnalyticService, ENTITY_TYPES } from "spinal-model-analysis"

	export default {
		name: "createEntityDialog",
		props: ["onFinised"],
		data() {
			this.types = ENTITY_TYPES;
			this.contextId;
			this.groupId;

			return {
				showDialog: true,
				entity: {
					name: "",
					standard_name:"",
					entityType: "",
					description: ""
				},
			};
		},

		methods: {
			opened(option) {
				console.log(option);
				this.contextId = option.selectedNode.id.get();
				console.log(this.contextId);
			},

			async removed(option) {
				if (option) {
					const newEntity = {
						name: this.entity.name,
						standard_name: this.entity.standard_name,
						entityType: this.types[this.entity.entityType],
						description: ""
					};
					const entityInfo = await spinalAnalyticService.addEntity(newEntity,this.contextId);
				}
				this.showDialog = false;
			},

			closeDialog(closeResult) {
				if (typeof this.onFinised === "function") {
					this.onFinised(closeResult);
				}
			},

			disabled() {
				return (
					this.entity.name.length === 0 ||
					this.entity.entityType === ""
				);
			},
		},
	};
</script>

<style scoped>
	.mdDialogContainer {
		width: 300px;
		height: 450px;
	}

	.mdDialogContainer .dialogTitle {
		text-align: center;
	}

	/* .mdIcon {
  display: flex;
  align-items: center;
} */
</style>
