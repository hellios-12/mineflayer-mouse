export type AttributeKeys = {
    "generic.armor": any;
    "generic.armor_toughness": any;
    "generic.attack_damage": any;
    "generic.attack_knockback": any;
    "generic.attack_speed": any;
    "player.block_break_speed": any;
    "player.block_interaction_range": any;
    "player.entity_interaction_range": any;
    "generic.fall_damage_multiplier": any;
    "generic.flying_speed": any;
    "generic.follow_range": any;
    "generic.gravity": any;
    "generic.jump_strength": any;
    "generic.knockback_resistance": any;
    "generic.luck": any;
    "generic.max_absorption": any;
    "generic.max_health": any;
    "generic.movement_speed": any;
    "generic.safe_fall_distance": any;
    "generic.scale": any;
    "zombie.spawn_reinforcements": any;
    "generic.step_height": any;
};
export declare const calculateAttribute: (attribute: {
    value: number;
    modifiers: {
        uuid: string;
        value: number;
        operation: number;
    }[];
}) => number;
