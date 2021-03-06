export default `

.ant-modal-content{
    background-color:var(--customed-color);
    color:#aaa;
}






.ant-table {
    background: var(--customed-color);
    color:var(--customed-font);
}

.ant-table.ant-table-small thead > tr > th {
    background: var(--customed-color);
    color:var(--customed-font);
}

.ant-pagination,.ant-pagination-item a{
    color:var(--customed-font);
}

.ant-pagination-jump-prev .ant-pagination-item-container .ant-pagination-item-ellipsis, .ant-pagination-jump-next .ant-pagination-item-container .ant-pagination-item-ellipsis{
    color:var(--customed-font);
}
.ant-form-item-label > label{
    color:var(--customed-font);
}





.ant-table-footer,.ant-modal-header,.ant-modal-confirm-body .ant-modal-confirm-content,.ant-modal-confirm-body .ant-modal-confirm-title,.ant-modal-body,.ant-modal-title,.ant-layout-sider-light,.ant-menu {
    color: var(--customed-font);
    background: var(--customed-bg);
}

.ant-table-thead>tr>th {
    color: var(--customed-font);
    background: var(--customed-bg);
    border-bottom: 1px solid #303030;
}





.ant-table-tbody>tr>td {
    border-bottom: 1px solid #303030;
    transition: background .3s
}

.ant-table-tbody>tr.ant-table-row:hover>td {
    background: #262626
}

.ant-table-tbody>tr.ant-table-row-selected>td {
    background: #111b26;
}

.ant-table-tbody>tr.ant-table-row-selected:hover>td {
    background: #0e161f
}



.ant-table-tbody>tr .ant-table-wrapper:only-child .ant-table td {
    background: transparent
}





.ant-table tfoot>tr>th,.ant-table tfoot>tr>td {
    border-bottom: 1px solid #303030
}



.ant-table-thead th.ant-table-column-has-sorters:hover {
    background: #303030
}

.ant-table-thead th.ant-table-column-has-sorters:hover .ant-table-filter-trigger-container {
    background: #353535
}

.ant-table-thead th.ant-table-column-sort {
    background: #262626
}

td.ant-table-column-sort {
    background: rgba(255,255,255,0.01)
}




.ant-table-column-sorter {
    color: #bfbfbf
}




.ant-table-column-sorter-up.active,.ant-table-column-sorter-down.active {
    color: #177ddc
}





.ant-table-filter-trigger-container-open,.ant-table-filter-trigger-container:hover,.ant-table-thead th.ant-table-column-has-sorters:hover .ant-table-filter-trigger-container:hover {
    background: #434343
}

.ant-table-filter-trigger {
    color: #bfbfbf;
}


.ant-table-filter-trigger-container-open .ant-table-filter-trigger,.ant-table-filter-trigger:hover {
    color: rgba(255,255,255,0.45)
}

.ant-table-filter-trigger.active {
    color: #177ddc
}

.ant-table-filter-dropdown {
    color: rgba(255,255,255,0.65);
    background-color: #1f1f1f;
    box-shadow: 0 3px 6px -4px rgba(0,0,0,0.48),0 6px 16px 0 rgba(0,0,0,0.32),0 9px 28px 8px rgba(0,0,0,0.2)
}










.ant-table-row-expand-icon {
    color: #177ddc;
    background: transparent;
    border: 1px solid #303030;
}

.ant-table-row-expand-icon:focus,.ant-table-row-expand-icon:hover {
    color: #165996
}

.ant-table-row-expand-icon:active {
    color: #388ed3
}

.ant-table-row-expand-icon-spaced {
    background: transparent;
    border: 0;
    visibility: hidden
}


tr.ant-table-expanded-row>td,tr.ant-table-expanded-row:hover>td {
    background: #1d1d1d
}

.ant-table-empty .ant-table-tbody>tr.ant-table-placeholder {
    color: rgba(255,255,255,0.3)
}

.ant-table-tbody>tr.ant-table-placeholder:hover>td {
    background: #141414
}

.ant-table-cell-fix-left,.ant-table-cell-fix-right {
    position: -webkit-sticky !important;
    position: sticky !important;
    z-index: 2;
    background: #141414
}
.ant-table-cell-fix-left-first::after,.ant-table-cell-fix-left-last::after {
    position: absolute;
    top: 0;
    right: 0;
    bottom: -1px;
    width: 30px;
    transform: translateX(100%);
    transition: box-shadow .3s;
    content: '';
    pointer-events: none
}

.ant-table-cell-fix-right-first::after,.ant-table-cell-fix-right-last::after {
    position: absolute;
    top: 0;
    bottom: -1px;
    left: 0;
    width: 30px;
    transform: translateX(-100%);
    transition: box-shadow .3s;
    content: '';
    pointer-events: none
}

.ant-table .ant-table-container::before,.ant-table .ant-table-container::after {
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 1;
    width: 30px;
    transition: box-shadow .3s;
    content: '';
    pointer-events: none
}




.ant-table-ping-left:not(.ant-table-has-fix-left) .ant-table-container::before {
    box-shadow: inset 10px 0 8px -8px rgba(0,0,0,0.45)
}

.ant-table-ping-left .ant-table-cell-fix-left-first::after,.ant-table-ping-left .ant-table-cell-fix-left-last::after {
    box-shadow: inset 10px 0 8px -8px rgba(0,0,0,0.45)
}

.ant-table-ping-right:not(.ant-table-has-fix-right) .ant-table-container {
    position: relative
}

.ant-table-ping-right:not(.ant-table-has-fix-right) .ant-table-container::after {
    box-shadow: inset -10px 0 8px -8px rgba(0,0,0,0.45)
}

.ant-table-ping-right .ant-table-cell-fix-right-first::after,.ant-table-ping-right .ant-table-cell-fix-right-last::after {
    box-shadow: inset -10px 0 8px -8px rgba(0,0,0,0.45)
}

.ant-card {
    background: var(--customed-color);
    color:var(--customed-font);
}
.ant-card-bordered{
    border: 1px solid var(--customed-border)
}
.ant-card-head{
    border-bottom: 1px solid var(--customed-border);
    color:var(--customed-font);
}
.ant-card-extra{
    color:var(--customed-font);
}
.ant-menu-inline, .ant-menu-vertical, .ant-menu-vertical-left{
    border-right: 1px solid var(--customed-bg);

}
.ant-radio-wrapper,
.ant-dropdown-menu-item, 
.ant-dropdown-menu-submenu-title,
.ant-slider-mark-text-active,
.ant-form,
.ant-empty-normal
{
    color:var(--customed-font)
}

`